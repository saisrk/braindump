import 'server-only';
import { isVideoUrl } from './video-detection';

export interface ExtractedContent {
  text: string;
  title: string | null;
  isVideo: boolean;
  domain?: string;
  /** True when content came from a web search fallback, not the page itself. */
  fromSearch?: boolean;
}

/**
 * Lightweight readability-style text extraction for a URL.
 * Falls back to an Anthropic web_search call when the page is blocked/paywalled.
 * Returns null only if both paths fail.
 */
export async function extractFromUrl(
  url: string
): Promise<ExtractedContent | null> {
  try {
    const isVideo = isVideoUrl(url);
    if (isVideo) {
      return {
        text: `Video content from: ${url}`,
        title: null,
        isVideo: true,
        domain: safeHostname(url),
      };
    }

    const direct = await fetchAndExtract(url);
    if (direct && direct.text.length >= 80) {
      return { ...direct, isVideo: false, domain: safeHostname(url) };
    }

    // Page blocked / insufficient content — fall back to web search.
    console.log(`[extract] Direct fetch insufficient for ${url}, trying web search fallback`);
    const searched = await searchFallback(url);
    if (searched) return searched;

    return null;
  } catch {
    return null;
  }
}

async function fetchAndExtract(url: string): Promise<{ text: string; title: string | null } | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BraindumpBot/1.0; +https://brain-dump.co)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : null;
    const text = htmlToText(html);
    if (!text) return null;

    return { text: text.slice(0, 8000), title };
  } catch {
    return null;
  }
}

/**
 * Uses Anthropic's built-in web_search tool to find and synthesise content
 * about a URL that couldn't be fetched directly (paywalls, bot blocks, etc).
 */
async function searchFallback(url: string): Promise<ExtractedContent | null> {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      tools: [{ type: 'web_search_20250305', name: 'web_search' } as any],
      messages: [
        {
          role: 'user',
          content:
            `The following URL cannot be fetched directly (paywall or bot block). ` +
            `Search the web to find the article and summarise its main content in 3-5 paragraphs. ` +
            `Include the article title, author if known, and key points. URL: ${url}`,
        },
      ],
    });

    // Collect all text blocks from the response (tool results + final answer).
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => (b as { type: 'text'; text: string }).text)
      .join('\n\n')
      .trim();

    if (!text || text.length < 80) return null;

    return {
      text: `[Sourced via web search — original page blocked]\n\n${text}`,
      title: null,
      isVideo: false,
      domain: safeHostname(url),
      fromSearch: true,
    };
  } catch (err) {
    console.error('[extract] web search fallback failed:', (err as Error).message);
    return null;
  }
}

function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<head[\s\S]*?<\/head>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeEntities(str: string): string {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—');
}

function safeHostname(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

export function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
