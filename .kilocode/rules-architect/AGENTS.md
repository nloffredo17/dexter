# Project Architecture Rules (Non-Obvious Only)

## Agent Architecture
- **Scratchpad uses JSONL format** (newline-delimited JSON) for resilient appending - entries are append-only, never rewritten
- **Anthropic-style context management**: Full tool results kept during iteration; when threshold (100k) exceeded, oldest cleared keeping 5 most recent
- Agent yields typed events via AsyncGenerator for real-time UI updates
- Final answer generated in **separate LLM call** with full scratchpad context (no tools bound)

## Tool Architecture
- **Rich descriptions** stored separately in `src/tools/descriptions/` and injected into system prompt, not tool schema
- `financial_search` is a **meta-tool** that internally routes to appropriate sub-tools based on query parsing
- Tools are **conditionally included** at runtime based on env var availability

## Skills Architecture
- Skills are SKILL.md files with YAML frontmatter, discovered at startup via filesystem scan
- Each skill can only be invoked **once per query** - enforced by agent logic, not tool-level
- Skill instructions returned to LLM as markdown; LLM follows them step-by-step

## Context Flow
```
User Query → Agent Loop → Tool Execution → Scratchpad (JSONL)
                                    ↓
                              Context Management
                              (threshold-based clearing)
                                    ↓
                         Final Answer Generation
                         (separate LLM call, no tools)
```

## Provider Abstraction
- **Prefix-based provider detection**: `claude-` → Anthropic, `gemini-` → Google, etc.
- **FAST_MODELS map** defines lightweight variants for summarization tasks per provider
- Anthropic requires explicit `cache_control` for prompt caching cost savings

## State Management
- Scratchpad is single source of truth for all tool results within a query
- InMemoryChatHistory provides conversation context (separate from scratchpad)
- Config in `.dexter/settings.json` with backwards compatibility migration layer
