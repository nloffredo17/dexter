# Security & Performance Review

**Date:** 2026-02-07  
**Scope:** Dexter codebase — vulnerabilities and performance optimization opportunities.

---

## 1. Architecture & Context

- **Monorepo:** `apps/cli` (Ink CLI), `packages/core` (agent, tools, model, skills, utils).
- **Key flows:** User query → Agent loop (LLM + tools) → Scratchpad (JSONL) → Final answer; API keys via `.env`; cache under `.dexter/cache/`; tools include finance API, browser (Playwright), search (Exa/Tavily).
- **Relevant patterns:** ESM with `.js` imports, Bun tests, provider detection by model prefix, conditional tools via env vars.

---

## 2. Vulnerability Findings

### 2.1 High: Cache path traversal

**Location:** `packages/core/src/utils/cache.ts` — `buildCacheKey()`, then `join(CACHE_DIR, cacheKey)`.

**Issue:** Cache key uses `params.ticker` as a filename prefix. Ticker comes from tool params (LLM-generated from user query). If the model returns something like `ticker: "../../../evil"`, the resulting path is `prices/../../../evil_<hash>.json`. When joined with `CACHE_DIR`, this can escape `.dexter/cache/` and write/read files elsewhere (e.g. overwrite or read files in project or home).

**Recommendation:**

- Sanitize any param used in the path (e.g. `ticker`): allow only safe characters (e.g. `[A-Z0-9.-]` for tickers) or use a safe slug (strip `/`, `\`, `..`, control chars).
- Alternatively, use only the hash for the filename and keep ticker only in the stored JSON for debugging (no ticker in path).

### 2.2 Medium: .env newline / key injection

**Location:** `packages/core/src/utils/env.ts` (and apps/cli copy) — `saveApiKeyToEnv(apiKeyName, apiKeyValue)`.

**Issue:** `apiKeyValue` is written directly into `.env` as `${apiKeyName}=${apiKeyValue}`. If the pasted “key” contains newlines or `=`, an attacker (or accidental paste) could inject extra env vars (e.g. `MALICIOUS_KEY=value` on the next line). `apiKeyName` is constrained when called via `saveApiKeyForProvider(providerId, apiKey)` (providerId from UI), but the value is user-controlled.

**Recommendation:**

- Reject or strip newlines and control characters in `apiKeyValue` before writing.
- Optionally validate that the line written contains no embedded newlines and only one `=` (key=value).

### 2.3 Medium: Browser tool URL scheme (SSRF / local file)

**Location:** `packages/core/src/tools/browser/browser.ts` — `navigate` and `open` use `p.goto(url)` / `newPage.goto(url)`.

**Issue:** `url` comes from the LLM (tool args from user query). Playwright will accept `file://` and `javascript:` etc. So the agent could be led to open local files (e.g. `file:///etc/passwd`) or run script in the page context, enabling local file disclosure or other abuse.

**Recommendation:**

- Before `goto`, allow only `http://` and `https://` (e.g. parse with `URL` and enforce `protocol === 'http:' || protocol === 'https:'`, reject otherwise).
- Optionally restrict hosts (e.g. block internal IPs) to reduce SSRF to internal services.

### 2.4 Low: No global agent/run timeout

**Location:** `apps/cli/src/hooks/useAgentRunner.ts` — `AbortController` is passed to the agent but never given a timeout; `packages/core/src/agent/agent.ts` uses `config.signal` for LLM/tool calls.

**Issue:** If the user never hits “cancel”, a stuck LLM call or tool (e.g. network hang) can run indefinitely, leading to resource exhaustion and poor UX.

**Recommendation:**

- Add an optional max run duration (e.g. 5–10 minutes). Create an `AbortController` with `AbortSignal.timeout(ms)` (or `setTimeout` + `abort()`) and pass its signal to the agent so long-running runs are aborted automatically.

### 2.5 Low: Skills path from disk

**Location:** `packages/core/src/skills/loader.ts` — `loadSkillFromPath(path)` uses `readFileSync(path)`; paths come from `packages/core/src/skills/registry.ts` (fixed dirs + `readdirSync`).

**Issue:** Paths are built from trusted dirs and `entry.name` from the filesystem. Risk is low unless a malicious symlink or crafted directory name is placed under `.dexter/skills` or project skills dir.

**Recommendation:** Keep as-is for now; optional hardening: resolve path and ensure it stays under the intended skill root (e.g. `path.resolve` and check `result.startsWith(resolvedRoot)`).

### 2.6 Informational: Finance API and other callers

- **Finance API** (`packages/core/src/tools/finance/api.ts`): `endpoint` is always a literal from tool code (e.g. `/prices/`, `/financial-metrics/`). Params (including `ticker`) are LLM-generated; only cache key sanitization (above) is needed for safety.
- **Config/settings:** `loadConfig` / `getSetting` read `.dexter/settings.json`; no user-controlled path.
- **Long-term chat history:** Path is `join(baseDir, '.dexter', 'messages', 'chat_history.json')` with `baseDir` defaulting to `process.cwd()` — no user-controlled path segment.
- **Scratchpad:** File path uses timestamp + hash of query; no user-supplied path, safe.

---

## 3. Performance Optimization Opportunities

### 3.1 Agent run: optional global timeout

**Location:** Same as 2.4.

**Change:** Add a configurable max run duration and pass an abort signal with timeout so runs cannot hang indefinitely. Improves both security and UX.

### 3.2 Event-driven UI: reduce re-renders during stream

**Location:** `apps/cli/src/hooks/useAgentRunner.ts` — `handleEvent` updates `history` and `workingState` on every agent event (thinking, tool_start, tool_progress, tool_end, etc.).

**Issue:** Each event causes `setHistory` and/or `setWorkingState`, so many events in quick succession can cause many re-renders (e.g. during tool_progress streaming). Ink can become sluggish with large history or many events.

**Recommendations:**

- **Batching:** Buffer events and flush state updates on a short timer (e.g. 50–100 ms) or on “important” events (e.g. tool_start, tool_end, done) so progress updates don’t each trigger a full re-render.
- **Stable references:** Ensure `history` updates use functional updates and avoid unnecessary new array/object references where possible (already partially done).
- **Virtualization / truncation:** If `AgentEventView` or history grows large, consider showing only the last N items or collapsing old tool results to avoid rendering hundreds of nodes.

### 3.3 Token and context usage

**Location:** `packages/core/src/utils/tokens.ts` — `CONTEXT_THRESHOLD = 100_000`, `KEEP_TOOL_USES = 5`; scratchpad clears oldest tool results when over threshold.

**Observation:** Context management is already in place. Optional improvements:

- Expose or log approximate token counts so users can see why answers might be truncated.
- Consider making `KEEP_TOOL_USES` or threshold configurable for heavy research sessions.

### 3.4 Cache and I/O

**Location:** `packages/core/src/utils/cache.ts`, `packages/core/src/tools/finance/api.ts`.

**Observation:** Cache is opt-in via `cacheable`, read-through, and uses sync I/O. For very high request volume, async I/O or a small in-memory LRU in front of file cache could reduce blocking; for typical CLI usage this is likely unnecessary.

### 3.5 LLM retries

**Location:** `packages/core/src/model/llm.ts` — `withRetry` with exponential backoff (500 * 2^attempt ms).

**Observation:** Reasonable; no change suggested unless you want to cap max delay or make attempts configurable.

### 3.6 Dependency audit

**Observation:** Project uses Bun and workspaces; `npm audit` failed due to missing npm lockfile (ENOLOCK). Recommend:

- Run `bun audit` if available, or generate a lockfile and run `npm audit` periodically.
- Keep LangChain, Playwright, and dotenv updated for security fixes.

---

## 4. Summary Table

| Item                         | Severity  | Area        | Action |
|-----------------------------|-----------|-------------|--------|
| Cache key path traversal    | High      | Security    | Sanitize ticker (or drop from path) in `buildCacheKey` |
| .env newline injection       | Medium    | Security    | Sanitize `apiKeyValue` in `saveApiKeyToEnv` |
| Browser URL scheme           | Medium    | Security    | Restrict to http/https in browser tool |
| No agent run timeout         | Low       | Security/Perf | Optional global AbortSignal timeout in CLI |
| Skills path                  | Low       | Security    | Optional: resolve and validate under skill root |
| Event-driven re-renders      | Perf      | CLI         | Batch or throttle state updates in `useAgentRunner` |
| Dependency audit             | Info      | Ops         | Use `bun audit` or npm lockfile + `npm audit` |

---

## 5. Suggested Implementation Order

1. **Cache path sanitization** — Prevents arbitrary file write/read; small, localized change.
2. **Browser URL allowlist** — Restricts browser tool to http/https; prevents file and script URL abuse.
3. **.env value sanitization** — Prevents accidental or malicious env injection.
4. **Optional run timeout** — Improves robustness and UX; can be behind a flag or config.
5. **Event batching in CLI** — Improves responsiveness when many events are emitted.
6. **Dependency and lockfile** — Establish regular audit (e.g. CI) and keep lockfile in sync.

---

*Review was conducted by exploring the repo structure, env/API key handling, cache and file paths, agent/tool flow, browser tool, CLI state updates, and token/config usage. No automated vulnerability scan was run; dependency audit was attempted but required a lockfile.*
