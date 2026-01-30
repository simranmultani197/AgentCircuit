import functools
import inspect
import time
from typing import Any, Optional, Callable, Dict, Type, Union
from pydantic import BaseModel

from .fuse import Fuse, LoopError
from .medic import Medic, MedicError
from .sentinel import Sentinel, SentinelError
from .storage import get_default_storage, BaseStorage


def reliable_node(
    sentinel_schema: Optional[Type[BaseModel]] = None,
    medic_repair: Optional[Callable[[Exception, Any], Any]] = None,
    llm_callable: Optional[Callable[[str], str]] = None,
    fuse_limit: int = 3,
    node_name: Optional[str] = None,
    storage: Optional[BaseStorage] = None,
):
    """
    Decorator to make any AI agent node reliable.
    Integrates Fuse (loop detection), Medic (recovery), and Sentinel (validation).

    Args:
        sentinel_schema: Pydantic model to validate outputs against
        medic_repair: Legacy callback for custom repair logic
        llm_callable: LLM callable for intelligent error repair
        fuse_limit: Max identical states before tripping loop detection (default 3)
        node_name: Override the node name (defaults to function name)
        storage: Custom storage backend (defaults to in-memory)
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Extract state and config
            state = args[0] if args else kwargs.get("state")
            config = None

            # Try to find config in args or kwargs
            for arg in args:
                if isinstance(arg, dict) and "configurable" in arg:
                    config = arg
                    break
            if not config:
                config = kwargs.get("config", {})

            # Attempt to identify run/thread
            run_id = (
                config.get("configurable", {}).get("thread_id")
                or config.get("run_id")
                or "local_dev_run"
            )

            actual_node_name = node_name or func.__name__

            # Initialize Components - use in-memory storage by default
            _storage = storage or get_default_storage()
            fuse = Fuse(limit=fuse_limit)
            medic = Medic(llm_callable=llm_callable)
            sentinel = Sentinel(schema=sentinel_schema)

            # Cost Tracking Helpers
            def estimate_tokens(obj: Any) -> int:
                s = str(obj)
                return len(s) // 4

            def get_cost(tokens: int) -> float:
                price_str = _storage.get_setting("cost_per_token") or "0.000005"
                return tokens * float(price_str)

            # 1. Fuse Check
            history_rows = _storage.get_run_history(run_id)
            node_history = [
                h["input_state"]
                for h in history_rows
                if h["node_id"] == actual_node_name
            ]

            try:
                fuse.check(history=[fuse._hash_state(s) for s in node_history], current_state=state)
            except LoopError as e:
                _storage.log_trace(
                    run_id=run_id,
                    node_id=actual_node_name,
                    input_state=state,
                    output_state=None,
                    status="failed_loop",
                    recovery_attempts=0
                )
                raise e

            # Filter kwargs for the wrapped function
            sig = inspect.signature(func)
            if "config" not in sig.parameters:
                kwargs.pop("config", None)

            # 2. Execution & Medic
            result = None
            status = "success"
            recovery_count = 0
            current_error = None
            saved_cost = 0.0
            diagnosis = None
            start_time = time.time()

            # Initial Execution
            try:
                result = func(*args, **kwargs)
            except Exception as e:
                current_error = e
                diagnosis = str(e)
                if medic_repair and not llm_callable:
                    try:
                        result = medic_repair(e, state)
                        status = "repaired"
                        recovery_count = 1
                        current_error = None
                    except Exception as legacy_e:
                        current_error = legacy_e
                        diagnosis = str(legacy_e)

            # Validate result if no error
            if not current_error:
                try:
                    result = sentinel.validate(result)
                except SentinelError as se:
                    current_error = se
                    diagnosis = str(se)

            # Recovery Loop (up to 2 attempts)
            while current_error and recovery_count < 2:
                recovery_count += 1
                try:
                    raw_output = result if isinstance(current_error, SentinelError) else "N/A (Execution Failed)"

                    fixed_data = medic.attempt_recovery(
                        error=current_error,
                        input_state=state,
                        raw_output=raw_output,
                        node_id=actual_node_name,
                        recovery_attempts=recovery_count,
                        schema=sentinel_schema
                    )

                    result = sentinel.validate(fixed_data)
                    current_error = None
                    status = "repaired"

                    cost_to_reach_here = _storage.get_run_cost(run_id)
                    medic_tokens = estimate_tokens(state) + estimate_tokens(current_error) + estimate_tokens(fixed_data) + 100
                    medic_cost = get_cost(medic_tokens)
                    raw_savings = cost_to_reach_here - medic_cost
                    saved_cost = max(0.0, raw_savings)

                except Exception as retry_e:
                    current_error = retry_e
                    diagnosis = str(retry_e)

            if current_error:
                duration_ms = (time.time() - start_time) * 1000
                _storage.log_trace(
                    run_id=run_id,
                    node_id=actual_node_name,
                    input_state=state,
                    output_state=str(current_error),
                    status="failed",
                    recovery_attempts=recovery_count,
                    saved_cost=0.0,
                    diagnosis=diagnosis,
                    duration_ms=duration_ms
                )
                raise current_error

            # Log Success
            token_usage = estimate_tokens(state) + estimate_tokens(result)
            estimated_cost = get_cost(token_usage)

            final_diagnosis = None
            if status == "repaired" and diagnosis:
                final_diagnosis = diagnosis
            elif status == "failed" and current_error:
                final_diagnosis = str(current_error)

            duration_ms = (time.time() - start_time) * 1000

            _storage.log_trace(
                run_id=run_id,
                node_id=actual_node_name,
                input_state=state,
                output_state=result,
                status=status,
                recovery_attempts=recovery_count,
                saved_cost=saved_cost,
                token_usage=token_usage,
                estimated_cost=estimated_cost,
                diagnosis=final_diagnosis,
                duration_ms=duration_ms
            )

            return result
        return wrapper
    return decorator


# Clean alias - the primary public API
reliable = reliable_node
