import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'HONS',
  description: 'Amazon product pages overlay prototype for HONS',
  version: '0.1.0',
  permissions: ['storage', 'tabs'],
  host_permissions: [
    'https://www.amazon.co.jp/*',
    'https://read.amazon.co.jp/*',
    'https://www.googleapis.com/*',
    'http://localhost:3000/*',
    'http://127.0.0.1:3000/*',
  ],
  background: {
    service_worker: 'src/background.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: [
        'https://www.amazon.co.jp/*',
        'https://read.amazon.co.jp/*',
        'http://localhost:3000/*',
        'http://127.0.0.1:3000/*',
      ],
      js: ['src/content.tsx'],
      run_at: 'document_idle',
    },
  ],
});
