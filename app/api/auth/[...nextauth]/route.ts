import { handlers } from '@/lib/auth';

// Make route dynamic to prevent static collection during build
export const dynamic = 'force-dynamic';

export const { GET, POST } = handlers;
