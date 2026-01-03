from typing import Callable, Any, Optional, Dict
import json
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

try:
    from groq import Groq
except ImportError:
    Groq = None

class Medic:
    """
    The Medic: Attempts to repair errors using an LLM-based repair loop.
    """
    def __init__(self, llm_callable: Optional[Callable[[str], str]] = None):
        self.llm_callable = llm_callable
        
        # Default to Groq if no callable provided and key exists
        if not self.llm_callable and Groq and os.environ.get("GROQ_API_KEY"):
            print("Medic: No custom LLM provided. Falling back to default Groq (llama-3.3-70b-versatile).")
            self.client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
            self.llm_callable = self._groq_callable

    def _groq_callable(self, prompt: str) -> str:
        """Default fallback using Groq."""
        chat_completion = self.client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
        )
        return chat_completion.choices[0].message.content

    def attempt_recovery(self, 
                         error: Exception, 
                         input_state: Any, 
                         raw_output: Any,
                         node_id: str,
                         recovery_attempts: int,
                         schema: Optional[Any] = None) -> Dict[str, Any]:
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
        schema_text = ""
        if schema:
            try:
                # Try Pydantic v2
                schema_text = json.dumps(schema.model_json_schema(), indent=2)
            except AttributeError:
                try:
                    # Try Pydantic v1
                    schema_text = schema.schema_json(indent=2)
                except:
                    schema_text = str(schema)

        prompt = f"""
SYSTEM: You are the air-os Medic. Your job is to fix a failed agent node.
CONTEXT: The node '{node_id}' failed with the following error: {str(error)}
INPUT DATA: {input_state}
PREVIOUS OUTPUT: {raw_output}
TARGET SCHEMA: {schema_text}

INSTRUCTION: Identify the mistake in the previous output. Correct the schema or logic to satisfy the requirements. Return ONLY the corrected JSON ignoring markdown formatting.
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
