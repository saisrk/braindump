import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
 * Extract metadata from blog/article content using Claude via Anthropic API
 * Analyzes page content to identify author, date, content type, and key points
 */
export async function analyzeBlogContent(
  url: string,
  text: string,
  title: string | null
): Promise<BlogMetadata> {
  try {
    const domain = new URL(url).hostname.replace('www.', '');

    const prompt = `You are analyzing a blog/article from the web.

URL: ${url}
Title: ${title || 'Unknown'}

Content (first 5000 chars):
${text.slice(0, 5000)}

Extract the following information and respond with valid JSON:
{
  "author": "Author name if you can identify it, or null",
  "publishDate": "ISO date string YYYY-MM-DD if available, or null",
  "domain": "${domain}",
  "contentType": "One of: blog, article, tutorial, documentation, news, or other",
  "keyPoints": ["Array of 5-7 key takeaways/learning points from this content"]
}

Respond with ONLY the JSON object, no other text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const parsed = JSON.parse(content.text);
    return {
      author: parsed.author || undefined,
      publishDate: parsed.publishDate || undefined,
      domain,
      contentType: parsed.contentType || 'article',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
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
 * Extract metadata from video URL and title using Claude
 * Handles YouTube, Vimeo, Loom, etc.
 */
export async function analyzeVideoMetadata(
  videoUrl: string,
  videoTitle?: string
): Promise<VideoMetadata> {
  try {
    const prompt = `You are analyzing a video source.

Video URL: ${videoUrl}
Video Title: ${videoTitle || 'Unknown'}

Based on the URL and title, extract the following information and respond with valid JSON:
{
  "videoTitle": "Clean video title",
  "videoChannel": "Channel/Creator name or 'Unknown'",
  "videoDuration": 0 (estimated or actual duration in seconds if inferrable, or null),
  "keyPoints": ["Array of 5-7 key learning points you'd expect from this video topic"]
}

Respond with ONLY the JSON object, no other text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const parsed = JSON.parse(content.text);
    return {
      videoTitle: parsed.videoTitle || videoTitle || 'Unknown Video',
      videoChannel: parsed.videoChannel || 'Unknown',
      videoDuration: parsed.videoDuration || undefined,
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    };
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
 * Generate key points from raw text content using Claude
 * Used as fallback or for note-based content
 */
export async function extractKeyPoints(text: string, maxPoints = 7): Promise<string[]> {
  try {
    const prompt = `Extract ${maxPoints} concise key points/takeaways from this text. Return as a JSON array of strings.

Text:
${text.slice(0, 3000)}

Respond with ONLY a JSON array like: ["point 1", "point 2", ...]`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return [];
    }

    const parsed = JSON.parse(content.text);
    return Array.isArray(parsed) ? parsed.slice(0, maxPoints) : [];
  } catch (error) {
    console.error('[v0] Key point extraction failed:', error);
    return [];
  }
}
