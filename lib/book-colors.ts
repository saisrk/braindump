export const BOOK_GRADIENTS = [
  'linear-gradient(135deg,#b5462f,#933827)',
  'linear-gradient(135deg,#6f8a5a,#546b43)',
  'linear-gradient(135deg,#46557a,#33405e)',
  'linear-gradient(135deg,#c79a3e,#a87f2c)',
  'linear-gradient(135deg,#8a5072,#6b3c58)',
  'linear-gradient(135deg,#4a4a4a,#333333)',
  'linear-gradient(135deg,#c97a4a,#a85f35)',
];

/** Deterministic gradient per topic name — same topic always gets same color. */
export function topicGradient(topic: string): string {
  let hash = 0;
  for (let i = 0; i < topic.length; i++) {
    hash = (hash * 31 + topic.charCodeAt(i)) | 0;
  }
  return BOOK_GRADIENTS[Math.abs(hash) % BOOK_GRADIENTS.length];
}
