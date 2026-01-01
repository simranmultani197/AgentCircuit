from typing import Callable, Any, Optional, Dict
import json

class Medic:
    """
    The Medic: Attempts to repair errors using an LLM-based repair loop.
    """
    def __init__(self, llm_callable: Optional[Callable[[str], str]] = None):
        self.llm_callable = llm_callable

    def attempt_recovery(self, 
                         error: Exception, 
                         input_state: Any, 
                         raw_output: Any,
                         node_id: str,
                         recovery_attempts: int) -> Dict[str, Any]:
        """
        Attempts to repair a failed node execution.
        """
        # 1. Check Limits
        if recovery_attempts > 2:
            raise MedicError(f"Medic: Critical Failure. Exceeded 2 recovery attempts. Original error: {error}")

        if not self.llm_callable:
             # Fallback: if no LLM provided, re-raise immediately
            raise error

        print(f"Medic: Initiating Repair Sequence (Attempt {recovery_attempts + 1})...")

        # 2. Construct Repair Prompt
        prompt = f"""
SYSTEM: You are the air-os Medic. Your job is to fix a failed agent node.
CONTEXT: The node '{node_id}' failed with the following error: {str(error)}
INPUT DATA: {input_state}
PREVIOUS OUTPUT: {raw_output}

INSTRUCTION: Identify the mistake in the previous output. Correct the schema or logic to satisfy the requirements. Return ONLY the corrected JSON. Do not explain your thought process.
"""
        
        # 3. Call LLM
        try:
            repair_str = self.llm_callable(prompt)
            # 4. Parse JSON
            # Clean possible markdown code blocks
            if "```json" in repair_str:
                repair_str = repair_str.split("```json")[1].split("```")[0].strip()
            elif "```" in repair_str:
                repair_str = repair_str.split("```")[1].split("```")[0].strip()
            
            return json.loads(repair_str)
        except Exception as e:
            raise MedicError(f"Medic: Repair failed during LLM call or parsing. Error: {e}") from e

class MedicError(Exception):
    pass
