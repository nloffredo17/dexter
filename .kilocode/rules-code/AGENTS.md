# Project Coding Rules (Non-Obvious Only)

## File Imports
- Always use `.js` extension in imports, even for TypeScript files (ESM requirement)
  - Correct: `import { Agent } from './agent.js'`
  - Incorrect: `import { Agent } from './agent'` or `import { Agent } from './agent.ts'`

## Tool System
- Tool results MUST be wrapped with [`formatToolResult()`](src/tools/types.ts) to ensure consistent structure
- Rich tool descriptions live in `src/tools/descriptions/` and are injected into system prompts - don't put descriptions in tool schema
- `financial_search` is a **meta-tool** - don't create tools that call it directly; extend the sub-tools it delegates to instead

## Skills
- Skill files are SKILL.md with YAML frontmatter (`name`, `description`) - parsed by `gray-matter`
- Each skill invocation is tracked and **can only run once per query** - design skills to be comprehensive, not composable

## Testing
- Use Bun's test runner: `bun test src/utils/cache.test.ts`
- Tests are colocated as `*.test.ts` (ignore the `__tests__/` pattern in jest.config.js - it's legacy)

## Browser Tool
- Uses Playwright's non-standard `_snapshotForAI()` method for page snapshots
- Don't use standard Playwright selectors - use the ref-based system from the snapshot
