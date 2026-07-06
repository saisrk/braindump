import 'server-only';
import { generateText, Output } from 'ai';
import { z } from 'zod';
import { FAST_MODEL } from './models';

const blogMetadataSchema = z.object({
  author: z.string().optional().describe('Author name if detectable'),
  publishDate: z.string().optional().describe('ISO date string YYYY-MM-DD if found'),
  domain: z.string().describe('Domain extracted from URL'),
  contentType: z.enum(['blog', 'article', 'tutorial', 'documentation', 'news', 'other']),
  keyPoints: z.array(z.string()).describe('5-7 key points/takeaways from the content'),
});

export type BlogMetadata = z.infer<typeof blogMetadataSchema>;

const videoMetadataSchema = z.object({
  videoTitle: z.string().describe('Video title'),
  videoChannel: z.string().describe('Channel/Creator name'),
  videoDuration: z.number().optional().describe('Duration in seconds if available'),
  keyPoints: z.array(z.string()).describe('5-7 key takeaways from the video'),
});

export type VideoMetadata = z.infer<typeof videoMetadataSchema>;

export async function analyzeBlogContent(
  url: string,
  text: string,
  title: string | null
): Promise<BlogMetadata> {
  const domain = (() => { try { return new URL(url).hostname.replace('www.', ''); } catch { return url; } })();
  try {
    const { experimental_output } = await generateText({
      model: FAST_MODEL,
      system: 'Extract structured metadata from a web article. Be concise and accurate.',
      prompt: `URL: ${url}\nTitle: ${title ?? 'Unknown'}\nDomain: ${domain}\n\nContent:\n${text.slice(0, 12000)}`,
      experimental_output: Output.object({ schema: blogMetadataSchema }),
    });
    return experimental_output;
  } catch {
    return { domain, contentType: 'article', keyPoints: [] };
  }
}

export async function analyzeVideoMetadata(
  videoUrl: string,
  videoTitle?: string
): Promise<VideoMetadata> {
  // Without a transcript there is no grounded content to extract takeaways from —
  // asking the model for "key points" from just a URL + title only invites it to
  // fabricate. Return honest metadata instead; transcript-grounded extraction is
  // tracked separately (Braindump-v2 Phase 4).
  const domain = (() => {
    try {
      return new URL(videoUrl).hostname.replace('www.', '');
    } catch {
      return undefined;
    }
  })();

  return {
    videoTitle: videoTitle ?? 'Unknown Video',
    videoChannel: domain ?? 'Unknown',
    keyPoints: [],
  };
}
