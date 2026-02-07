// Core exports for @dexter/core package

// Agent
export { Agent } from './agent/agent.js';
export type {
  AgentConfig,
  AgentEvent,
  Message,
  ThinkingEvent,
  ToolStartEvent,
  ToolProgressEvent,
  ToolEndEvent,
  ToolErrorEvent,
  ToolLimitEvent,
  ContextClearedEvent,
  AnswerStartEvent,
  DoneEvent,
  TokenUsage,
} from './agent/types.js';
export { Scratchpad, type ToolContext } from './agent/scratchpad.js';
export { TokenCounter } from './agent/token-counter.js';
export { buildSystemPrompt, getCurrentDate, DEFAULT_SYSTEM_PROMPT } from './agent/prompts.js';

// Tools
export { getToolRegistry, getTools, buildToolDescriptions } from './tools/registry.js';
export type { RegisteredTool } from './tools/registry.js';
export type { ToolResult } from './tools/types.js';
export { formatToolResult, parseSearchResults } from './tools/types.js';
export { skillTool, SKILL_TOOL_DESCRIPTION } from './tools/skill.js';

// Browser tools
export { browserTool } from './tools/browser/browser.js';

// Finance tools
export {
  createFinancialSearch,
  createFinancialMetrics,
  createReadFilings,
} from './tools/finance/index.js';

// Search tools
export { exaSearch, tavilySearch } from './tools/search/index.js';

// Tool descriptions
export {
  FINANCIAL_SEARCH_DESCRIPTION,
  FINANCIAL_METRICS_DESCRIPTION,
  READ_FILINGS_DESCRIPTION,
  WEB_SEARCH_DESCRIPTION,
  BROWSER_DESCRIPTION,
} from './tools/descriptions/index.js';

// Model
export {
  callLlm,
  getFastModel,
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
} from './model/llm.js';

// Skills
export { parseSkillFile, loadSkillFromPath, extractSkillMetadata } from './skills/loader.js';
export { discoverSkills, buildSkillMetadataSection, getSkill, clearSkillCache } from './skills/registry.js';
export type { Skill, SkillMetadata, SkillSource } from './skills/types.js';

// Utils
export { describeRequest, buildCacheKey, readCache, writeCache } from './utils/cache.js';
export { loadConfig, saveConfig, getSetting, setSetting } from './utils/config.js';
export {
  getApiKeyNameForProvider,
  getProviderDisplayName,
  checkApiKeyExistsForProvider,
} from './utils/env.js';
export { logger } from './utils/logger.js';
export type { LogEntry, LogLevel } from './utils/logger.js';
export { estimateTokens, TOKEN_BUDGET, CONTEXT_THRESHOLD, KEEP_TOOL_USES } from './utils/tokens.js';
export { extractTextContent, hasToolCalls } from './utils/ai-message.js';
export { getToolDescription } from './utils/tool-description.js';
export { InMemoryChatHistory } from './utils/in-memory-chat-history.js';
export { createProgressChannel } from './utils/progress-channel.js';
