import { OPEN_KINDLE_SYNC_TAB_MESSAGE, type OpenKindleSyncTabResponse } from './messages';

const DASHBOARD_SOURCE = 'bookhub-web';
const EXTENSION_SOURCE = 'bookhub-extension';
const SNAPSHOT_KEY = 'bookhubKindleLibrarySnapshot';

type DashboardRequestType = 'BOOKHUB_START_SYNC' | 'BOOKHUB_GET_SNAPSHOT';

interface DashboardRequest {
  source: typeof DASHBOARD_SOURCE;
  type: DashboardRequestType;
}

function postToPage(payload: Record<string, unknown>) {
  window.postMessage(
    {
      source: EXTENSION_SOURCE,
      ...payload,
    },
    window.location.origin,
  );
}

async function getSnapshot() {
  const stored = await chrome.storage.local.get(SNAPSHOT_KEY);
  return stored[SNAPSHOT_KEY] ?? null;
}

export function initializeWebDashboardBridge() {
  const onMessage = (event: MessageEvent<DashboardRequest>) => {
    if (event.source !== window) return;
    if (event.origin !== window.location.origin) return;
    if (event.data?.source !== DASHBOARD_SOURCE) return;

    if (event.data.type === 'BOOKHUB_GET_SNAPSHOT') {
      void getSnapshot().then((snapshot) => {
        postToPage({ type: 'BOOKHUB_SNAPSHOT', payload: snapshot });
      });
      return;
    }

    if (event.data.type === 'BOOKHUB_START_SYNC') {
      void chrome.runtime
        .sendMessage({
          type: OPEN_KINDLE_SYNC_TAB_MESSAGE,
          payload: { trigger: 'web' },
        })
        .then((response: OpenKindleSyncTabResponse) => {
          postToPage({
            type: 'BOOKHUB_START_SYNC_RESULT',
            payload: response,
          });
        })
        .catch((error: unknown) => {
          postToPage({
            type: 'BOOKHUB_START_SYNC_RESULT',
            payload: { ok: false, error: error instanceof Error ? error.message : 'failed to open kindle tab' },
          });
        });
    }
  };

  window.addEventListener('message', onMessage);
}
