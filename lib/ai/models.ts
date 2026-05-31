/**
 * Model selection for Braindump's AI features.
 *
 * Uses the Vercel AI Gateway (zero-config for Anthropic when AI_GATEWAY_API_KEY
 * is set). Pass these strings directly to `generateText` / `streamText`.
 */

/** Fast, cheap model for extraction & summarization (capture, digests). */
export const FAST_MODEL = 'anthropic/claude-haiku-4.5';

/** Higher-quality model for grading, reasoning and generation (teach-back, express). */
export const SMART_MODEL = 'anthropic/claude-sonnet-4.6';
