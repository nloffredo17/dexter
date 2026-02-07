# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Napkin (session memory)

- **Read [`.cursor/napkin.md`](.cursor/napkin.md) at the start of every session** before doing anything else. Apply what’s there; don’t announce it.
- **Update the napkin as you work**: log your own mistakes, user corrections, tool/env surprises, and what worked or didn’t. Keep entries specific and actionable.
- If `.cursor/napkin.md` is missing, create it with sections: Corrections (table), User Preferences, Patterns That Work, Patterns That Don’t Work, Domain Notes.

## Non-Obvious Project Patterns

### Skills System (SKILL.md files)
- Skills are markdown files with YAML frontmatter (`name`, `description`) in `src/skills/*/SKILL.md`
- Parsed by `gray-matter` in [`src/skills/loader.ts`](src/skills/loader.ts:16)
- Each skill can only be invoked **once per query** (enforced in agent logic)
- Built-in skill: DCF valuation at `src/skills/dcf/SKILL.md`

### Agent Architecture
- **Scratchpad uses JSONL format** (newline-delimited JSON) for resilient appending - see [`src/agent/scratchpad.ts`](src/agent/scratchpad.ts:74)
- **Anthropic-style context management**: When context exceeds 100k tokens, oldest results are cleared keeping only 5 most recent - see [`src/utils/tokens.ts`](src/utils/tokens.ts:30)
- **Agent yields typed events** via AsyncGenerator for real-time UI updates - see [`src/agent/types.ts`](src/agent/types.ts:27)
- Final answer is generated in a **separate LLM call** with full scratchpad context (no tools bound)

### Tool System
- **Rich descriptions** stored separately in `src/tools/descriptions/` are injected into system prompt, not tool schema
- Tools are **conditionally included** based on env vars in [`src/tools/registry.ts`](src/tools/registry.ts:53)
- `financial_search` is a **meta-tool** that delegates to multiple sub-tools internally
- Web search prefers Exa, falls back to Tavily (not the other way around)

### LLM Provider Handling
- **Provider detection is prefix-based**: `claude-` → Anthropic, `gemini-` → Google, `grok-` → xAI, `ollama:` → Ollama, `openrouter:` → OpenRouter
- **FAST_MODELS map** in [`src/model/llm.ts`](src/model/llm.ts:19) defines lightweight variants for summarization tasks
- Anthropic uses explicit `cache_control` on system prompt for cost savings

### Cache & Storage
- Cache files live in `.dexter/cache/` with **human-readable filenames** prefixed by ticker (e.g., `prices/AAPL_a1b2c3d4.json`)
- Config stored in `.dexter/settings.json` with **model→provider migration logic** for backwards compatibility - see [`src/utils/config.ts`](src/utils/config.ts:7)
- Scratchpad files persisted to `.dexter/scratchpad/` for debugging

### Testing
- **Bun's built-in test runner is primary**; Jest config exists only for legacy compatibility
- Tests are **colocated** as `*.test.ts` (ignore jest.config.js mentioning `__tests__/`)
- Run single test: `bun test src/utils/cache.test.ts`

### Version & Release
- **CalVer format**: `YYYY.M.D` (no zero-padding, e.g., `2026.2.6` not `2026.02.06`)
- Release script: `bash scripts/release.sh [version]` (defaults to today's date)

### Code Conventions
- All file imports use `.js` extension (ESM) even for TypeScript files
- Tool results formatted via [`formatToolResult()`](src/tools/types.ts) to ensure consistent structure
- Browser tool uses Playwright's non-standard `_snapshotForAI()` method
