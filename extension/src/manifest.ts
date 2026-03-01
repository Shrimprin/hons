import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "BookHub Prototype",
  description: "Amazon product pages overlay prototype for BookHub",
  version: "0.1.0",
  permissions: ["storage"],
  host_permissions: [
    "https://www.amazon.co.jp/*",
    "https://read.amazon.co.jp/*",
    "https://www.googleapis.com/*",
  ],
  background: {
    service_worker: "src/background.ts",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["https://www.amazon.co.jp/*", "https://read.amazon.co.jp/*"],
      js: ["src/content.tsx"],
      run_at: "document_idle",
    },
  ],
});
