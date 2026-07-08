import { isVideoUrl } from './video-detection';

/**
 * Deterministic, zero-cost classification of a URL that the capture pipeline
 * can't (or won't yet) turn into a learning — checked before we ever spend a
 * fetch or AI call on it. Anything not caught here still goes through the
 * real extraction pipeline and may fail there for other reasons (see the
 * server-classified kinds in lib/actions/capture.ts).
 */
export type PrecheckIssueKind = 'video' | 'file' | 'private_link';

const FILE_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.epub', '.zip', '.csv',
];

// Known share-link paths for chat/app UIs that require the visitor's own
// login session to open — there is no public page for us to fetch, ever.
const PRIVATE_LINK_PATTERNS: RegExp[] = [
  /gemini\.google\.com\/app\//i,
  /chat\.openai\.com\/c\//i,
  /chatgpt\.com\/c\//i,
  /claude\.ai\/chat\//i,
  /claude\.ai\/share\//i,
];

export function isFileUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return FILE_EXTENSIONS.some((ext) => path.endsWith(ext));
  } catch {
    return false;
  }
}

export function isPrivateAppLink(url: string): boolean {
  return PRIVATE_LINK_PATTERNS.some((re) => re.test(url));
}

/** Checked client-side, before submitting — order matters (video wins over generic file). */
export function detectSourceIssue(url: string): PrecheckIssueKind | null {
  if (isVideoUrl(url)) return 'video';
  if (isFileUrl(url)) return 'file';
  if (isPrivateAppLink(url)) return 'private_link';
  return null;
}

/**
 * Kinds surfaced by the actual extraction/AI pipeline once it's run — can't
 * be known just from the URL string, so these come back from analyzeCapture.
 */
export type ServerIssueKind = 'thin_content' | 'too_short' | 'ai_failed';

export type CaptureIssueKind = PrecheckIssueKind | ServerIssueKind;

export interface CaptureIssueCopy {
  icon: string;
  title: string;
  body: string;
  cta: string;
}

export const CAPTURE_ISSUE_COPY: Record<CaptureIssueKind, CaptureIssueCopy> = {
  video: {
    icon: '🎬',
    title: 'Video capture is on the way',
    body: "We're building the ability to learn straight from videos. For now, paste the key moments or a summary as text below and we'll turn it into flashcards right now.",
    cta: 'Paste text instead',
  },
  file: {
    icon: '📄',
    title: 'File uploads are on the way',
    body: "We don't support files like PDFs and docs yet. Paste the text you want to remember below — it works instantly.",
    cta: 'Paste text instead',
  },
  private_link: {
    icon: '🔒',
    title: 'That link looks private',
    body: "This URL needs your own login to open (like a chat or app share), so we can't fetch it. Paste the content directly instead.",
    cta: 'Paste text instead',
  },
  thin_content: {
    icon: '🧭',
    title: "Couldn't find much to read there",
    body: 'That link might be a homepage, paywalled, or blocking automatic reading. Try linking the exact article, or paste the passage you want below.',
    cta: 'Paste text instead',
  },
  too_short: {
    icon: '✍️',
    title: 'Just a little more to go on',
    body: 'Add a sentence or two of detail so AI has something to work with.',
    cta: 'Got it',
  },
  ai_failed: {
    icon: '⚡',
    title: 'Our AI hit a snag',
    body: "Something glitched summarizing this — try again in a moment, or paste the text directly instead.",
    cta: 'Try again',
  },
};
