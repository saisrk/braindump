import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Braindump',
    short_name: 'Braindump',
    description: 'Capture what you read. Actually remember it.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5f2ec',
    theme_color: '#b5462f',
    icons: [
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
    ],
  };
}
