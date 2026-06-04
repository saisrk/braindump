/**
 * Detect video platform from URL and extract video ID/metadata
 * Can be used from both client and server contexts
 */
export interface VideoInfo {
  platform: 'youtube' | 'vimeo' | 'loom' | 'other';
  videoId?: string;
  url: string;
  title?: string;
}

/**
 * Extract video platform and ID from URL
 */
export function detectVideoUrl(url: string): VideoInfo | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // YouTube
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      let videoId: string | undefined;

      if (hostname.includes('youtu.be')) {
        videoId = urlObj.pathname.slice(1).split('?')[0];
      } else {
        videoId = urlObj.searchParams.get('v') || undefined;
      }

      return {
        platform: 'youtube',
        videoId,
        url,
      };
    }

    // Vimeo
    if (hostname.includes('vimeo.com')) {
      const matches = urlObj.pathname.match(/\/(\d+)/);
      const videoId = matches?.[1];

      return {
        platform: 'vimeo',
        videoId,
        url,
      };
    }

    // Loom
    if (hostname.includes('loom.com')) {
      const videoId = urlObj.pathname.split('/').pop();

      return {
        platform: 'loom',
        videoId,
        url,
      };
    }

    // Generic video indicator (could be other platforms)
    if (
      url.includes('video') ||
      url.includes('watch') ||
      url.includes('.mp4') ||
      url.includes('.webm')
    ) {
      return {
        platform: 'other',
        url,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Check if URL is likely to be video content
 */
export function isVideoUrl(url: string): boolean {
  return detectVideoUrl(url) !== null;
}

/**
 * Generate thumbnail URL for video (best effort)
 */
export function getVideoThumbnailUrl(videoInfo: VideoInfo): string | null {
  switch (videoInfo.platform) {
    case 'youtube':
      return videoInfo.videoId
        ? `https://img.youtube.com/vi/${videoInfo.videoId}/maxresdefault.jpg`
        : null;
    case 'vimeo':
      // Vimeo requires API call, return null for now
      return null;
    case 'loom':
      // Loom generates thumbnails dynamically
      return null;
    default:
      return null;
  }
}
