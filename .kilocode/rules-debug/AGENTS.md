# Project Debug Rules (Non-Obvious Only)

## Debug Locations
- Scratchpad files persisted to `.dexter/scratchpad/` for debugging agent execution flow
- Cache files in `.dexter/cache/` use human-readable filenames with ticker prefixes (e.g., `prices/AAPL_*.json`)

## Context Management Debugging
- When context exceeds 100k tokens, oldest results are cleared keeping only 5 most recent
- Check scratchpad file size if agent seems to "forget" earlier tool results

## Tool Registry Debugging
- Tools are **conditionally included** based on env vars:
  - `web_search` only appears if `EXASEARCH_API_KEY` or `TAVILY_API_KEY` is set
  - `skill` tool only appears if skills are discovered at startup
- If a tool is missing, check env vars and [`src/tools/registry.ts`](src/tools/registry.ts:53)

## Provider-Specific Issues
- Anthropic uses explicit `cache_control` on system prompt - check token usage if costs seem high
- Provider detection is prefix-based; verify model name prefix matches expected provider

## Cache Debugging
- Cache is opt-in per API call via `{ cacheable: true }` option
- Cache filenames include ticker prefix for readability: `prices/AAPL_a1b2c3d4.json`
