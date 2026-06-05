import 'server-only';
import { isVideoUrl } from './video-detection';

/**
 * Extended extraction result with optional metadata
 */
export interface ExtractedContent {
  text: string;
  title: string | null;
  isVideo: boolean;
  domain?: string;
}

/**
 * Lightweight readability-style text extraction for a URL.
 * Fetches the page and strips markup to give the AI clean source text.
 * Returns null on failure so capture never hard-blocks on a bad URL.
 */
export async function extractFromUrl(
  url: string
): Promise<ExtractedContent | null> {
  try {
    // Check if it's a video URL first
    const isVideo = isVideoUrl(url);
    if (isVideo) {
      return {
        text: `Video content from: ${url}`,
        title: null,
        isVideo: true,
        domain: new URL(url).hostname.replace('www.', ''),
      };
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; BraindumpBot/1.0; +https://braindump.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      // Avoid hanging on slow pages.
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;

    const html = await res.text();

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : null;

    const text = htmlToText(html);
    if (!text) return null;

    return {
      text: text.slice(0, 8000),
      title,
      isVideo: false,
      domain: new URL(url).hostname.replace('www.', ''),
    };
  } catch {
    return null;
  }
}

function htmlToText(html: string): string {
  return decodeEntities(
    html
      // Drop non-content elements entirely.
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<head[\s\S]*?<\/head>/gi, ' ')
      .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
      // Strip remaining tags.
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

export function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}
