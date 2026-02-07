# Project Documentation Rules (Non-Obvious Only)

## Hidden Documentation
- Tool descriptions in `src/tools/descriptions/` are the canonical reference for when to use tools - they get injected into the system prompt
- Skill instructions in `src/skills/*/SKILL.md` are the actual workflows the agent follows

## Counterintuitive Structure
- `src/tools/finance/` contains sub-tools; the main entry point is `financial_search` meta-tool in `src/tools/finance/index.ts`
- `src/tools/descriptions/` contains rich descriptions separate from tool implementations
- `src/evals/` contains a full Ink/React app for LangSmith evaluation (not just test scripts)

## Configuration
- Config stored in `.dexter/settings.json` with model→provider migration for backwards compatibility
- Old `model` key automatically migrates to `provider` key on load

## Code Patterns
- **Agent yields typed events** via AsyncGenerator - look at [`src/agent/types.ts`](src/agent/types.ts:27) for event types
- Final answer is generated in a **separate LLM call** with full scratchpad context (no tools bound)

## Version Format
- Uses CalVer `YYYY.M.D` (no zero-padding) - e.g., `2026.2.6` not `2026.02.06`
