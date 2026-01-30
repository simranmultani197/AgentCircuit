# AirOS

**One decorator to make any AI agent reliable.**

```
pip install airos
```

AirOS wraps your AI agent functions with three invisible safety nets:

- **Fuse** - Detects infinite loops and kills them before they drain your wallet
- **Medic** - Catches exceptions and auto-repairs outputs using an LLM
- **Sentinel** - Validates every output against your Pydantic schema

Zero config. No server. No database. Just a decorator.

---

## Before / After

**Before** - your agent crashes, loops forever, or returns garbage:

```python
def extract_data(state):
    result = call_llm(state["text"])
    return json.loads(result)  # crashes on malformed JSON
```

**After** - one line change, your agent self-heals:

```python
from airos import reliable
from pydantic import BaseModel

class Output(BaseModel):
    name: str
    age: int

@reliable(sentinel_schema=Output)
def extract_data(state):
    result = call_llm(state["text"])
    return json.loads(result)  # if this crashes, Medic fixes it
```

What happens behind the scenes:
1. **Fuse** checks if this node is stuck in a loop (same input seen 3+ times)
2. Your function runs normally
3. **Sentinel** validates the output against `Output` schema
4. If anything fails, **Medic** calls an LLM to fix the output
5. If Medic fails twice, the error propagates (no silent failures)

---

## Quick Start

### Minimal (no LLM, just validation + loop detection)

```python
from airos import reliable
from pydantic import BaseModel

class SearchResult(BaseModel):
    query: str
    results: list[str]

@reliable(sentinel_schema=SearchResult, fuse_limit=5)
def search_node(state):
    return {"query": state["q"], "results": ["result1", "result2"]}
```

### With Auto-Repair (add an LLM for self-healing)

```python
pip install airos[groq]  # or airos[openai] or airos[anthropic]
```

```python
import os
from groq import Groq

client = Groq(api_key=os.environ["GROQ_API_KEY"])

def my_llm(prompt: str) -> str:
    return client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.3-70b-versatile"
    ).choices[0].message.content

@reliable(sentinel_schema=SearchResult, llm_callable=my_llm)
def search_node(state):
    return {"query": state["q"], "results": ["result1", "result2"]}
```

Now if `search_node` throws an exception or returns invalid data, Medic will use your LLM to generate a valid output matching the schema.

### With LangGraph

```python
from langgraph.graph import StateGraph
from airos import reliable
from pydantic import BaseModel

class AgentState(BaseModel):
    messages: list[str]
    result: str = ""

@reliable(sentinel_schema=AgentState, fuse_limit=3)
def process_node(state):
    # Your agent logic
    return {"messages": state["messages"], "result": "done"}

graph = StateGraph(AgentState)
graph.add_node("process", process_node)
```

### With LangChain / CrewAI / AutoGen

```python
from airos import get_adapter

# LangChain
adapter = get_adapter("langchain", fuse_limit=5)
wrapped_chain = adapter.wrap_chain(my_chain, schema=OutputSchema)

# CrewAI
adapter = get_adapter("crewai")
wrapped_agent = adapter.wrap_agent(my_agent)

# AutoGen
adapter = get_adapter("autogen")
wrapped_function = adapter.wrap_function(my_tool)
```

---

## How It Works

```
Your Function
     |
     v
  [ Fuse ] -- Loop detected? --> STOP (LoopError)
     |
     v
  Run your function
     |
     v
  [ Sentinel ] -- Output valid? --> Return result
     |
     v (invalid)
  [ Medic ] -- LLM fixes output --> [ Sentinel ] validates again
     |
     v (still fails after 2 attempts)
  Raise original error (no silent failures)
```

## Storage

By default, AirOS stores traces **in memory** (lost when process exits). For persistence:

```python
from airos import reliable, set_default_storage
from airos.storage import Storage  # SQLite backend

set_default_storage(Storage())  # Now traces persist to .air_os/traces.db

@reliable()
def my_node(state):
    return state
```

Or pass storage per-decorator:

```python
from airos.storage import Storage

db = Storage(db_path="my_traces.db")

@reliable(storage=db)
def my_node(state):
    return state
```

## Installation Options

```bash
pip install airos                 # Core only (pydantic). Validation + loop detection.
pip install airos[groq]           # + Groq for auto-repair
pip install airos[openai]         # + OpenAI for auto-repair
pip install airos[anthropic]      # + Anthropic for auto-repair
pip install airos[langchain]      # + LangChain adapter
pip install airos[crewai]         # + CrewAI adapter
pip install airos[llm]            # All LLM providers
pip install airos[all]            # Everything
```

## API Reference

### `@reliable()` / `@reliable_node()`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `sentinel_schema` | `BaseModel` | `None` | Pydantic model for output validation |
| `llm_callable` | `Callable[[str], str]` | `None` | LLM function for auto-repair |
| `fuse_limit` | `int` | `3` | Max identical states before loop detection |
| `node_name` | `str` | `None` | Override function name for traces |
| `storage` | `BaseStorage` | `InMemoryStorage` | Storage backend for traces |
| `medic_repair` | `Callable` | `None` | Custom repair callback (legacy) |

### Core Components

```python
from airos import Fuse, Medic, Sentinel  # Use individually if needed
```

- **`Fuse(limit=3)`** - Loop detection via state hashing
- **`Medic(llm_callable=...)`** - LLM-based error recovery
- **`Sentinel(schema=...)`** - Pydantic schema validation

## Running Tests

```bash
pip install airos[dev]
pytest
```

## License

MIT
