import { anthropic } from '@ai-sdk/anthropic';

// ANTHROPIC_API_KEY is read automatically from env by the provider.

/** Fast, cheap model for extraction & summarization (capture, digests). */
export const FAST_MODEL = anthropic('claude-haiku-4-5');

/** Higher-quality model for grading, reasoning and generation (teach-back, express). */
export const SMART_MODEL = anthropic('claude-sonnet-4-6');
