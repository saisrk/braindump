import 'server-only';
import { generateText, generateObject } from 'ai';
import { z } from 'zod';
import { FAST_MODEL } from './models';

/* ------------------------------------------------------------------ */
/* Content Metadata Extraction & Analysis                              */
/* ------------------------------------------------------------------ */

/**
 * Schema for blog/article metadata extraction from page content
 */
const blogMetadataSchema = z.object({
  author: z.string().optional().describe('Author name if detectable'),
  publishDate: z.string().optional().describe('ISO date string if found'),
  domain: z.string().describe('Domain extracted from URL'),
  contentType: z.enum(['blog', 'article', 'tutorial', 'documentation', 'news', 'other']).describe('Type of content'),
  keyPoints: z.array(z.string()).describe('5-7 key points/takeaways from the content'),
});

export type BlogMetadata = z.infer<typeof blogMetadataSchema>;

/**
 * Schema for video metadata extraction
 */
const videoMetadataSchema = z.object({
  videoTitle: z.string().describe('Video title'),
  videoChannel: z.string().describe('Channel/Creator name'),
  videoDuration: z.number().optional().describe('Duration in seconds if available'),
  keyPoints: z.array(z.string()).describe('5-7 key takeaways from the video'),
});

export type VideoMetadata = z.infer<typeof videoMetadataSchema>;

/**
 * Extract metadata from blog/article content using LLM
 * Analyzes page content to identify author, date, content type, and key points
 */
export async function analyzeBlogContent(
  url: string,
  text: string,
  title: string | null
): Promise<BlogMetadata> {
  try {
    const domain = new URL(url).hostname.replace('www.', '');

    const result = await generateObject({
      model: FAST_MODEL,
      schema: blogMetadataSchema,
      prompt: `You are analyzing a blog/article from the web.

URL: ${url}
Title: ${title || 'Unknown'}

Content (first 5000 chars):
${text.slice(0, 5000)}

Extract:
1. Author name if you can identify it
2. Publication date if available (format as ISO string YYYY-MM-DD)
3. Content type classification
4. 5-7 key takeaways/learning points from this content

Return the data in structured format.`,
    });

    return {
      ...result.object,
      domain,
    };
  } catch (error) {
    console.error('[v0] Blog analysis failed:', error);
    // Return minimal metadata on failure
    return {
      domain: new URL(url).hostname.replace('www.', ''),
      contentType: 'article',
      keyPoints: [],
    };
  }
}

/**
 * Extract metadata from video URL and title
 * Handles YouTube, Vimeo, Loom, etc.
 */
export async function analyzeVideoMetadata(
  videoUrl: string,
  videoTitle?: string
): Promise<VideoMetadata> {
  try {
    const result = await generateObject({
      model: FAST_MODEL,
      schema: videoMetadataSchema,
      prompt: `You are analyzing a video source.

Video URL: ${videoUrl}
Video Title: ${videoTitle || 'Unknown'}

Based on the URL and title, extract:
1. Clean video title
2. Channel/Creator name
3. Estimated or actual duration in seconds if inferrable
4. 5-7 key learning points you'd expect from this video topic

Return the data in structured format.`,
    });

    return result.object;
  } catch (error) {
    console.error('[v0] Video metadata extraction failed:', error);
    // Return minimal data on failure
    return {
      videoTitle: videoTitle || 'Unknown Video',
      videoChannel: 'Unknown',
      keyPoints: [],
    };
  }
}

/**
 * Generate key points from raw text content
 * Used as fallback or for note-based content
 */
export async function extractKeyPoints(text: string, maxPoints = 7): Promise<string[]> {
  try {
    const result = await generateText({
      model: FAST_MODEL,
      prompt: `Extract ${maxPoints} concise key points/takeaways from this text. Return one per line.

Text:
${text.slice(0, 3000)}`,
    });

    return result.text
      .split('\n')
      .map(p => p.replace(/^\d+\.\s*/, '').trim())
      .filter(p => p.length > 0)
      .slice(0, maxPoints);
  } catch (error) {
    console.error('[v0] Key point extraction failed:', error);
    return [];
  }
}
