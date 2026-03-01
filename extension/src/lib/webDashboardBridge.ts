import { OPEN_KINDLE_SYNC_TAB_MESSAGE, type OpenKindleSyncTabResponse } from './messages';

const DASHBOARD_SOURCE = 'bookhub-web';
const EXTENSION_SOURCE = 'bookhub-extension';
const SNAPSHOT_KEY = 'bookhubKindleLibrarySnapshot';
const BRIDGE_FLAG = '__honsBridgeInitialized__';

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

function hasChromeRuntime(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.runtime?.id);
}

function hasChromeStorage(): boolean {
  return typeof chrome !== 'undefined' && Boolean(chrome.storage?.local);
}

async function getSnapshot() {
  if (!hasChromeStorage()) return null;
  try {
    const stored = await chrome.storage.local.get(SNAPSHOT_KEY);
    return stored[SNAPSHOT_KEY] ?? null;
  } catch {
    return null;
  }
}

export function initializeWebDashboardBridge() {
  const win = window as Window & { __honsBridgeInitialized__?: boolean };
  if (win[BRIDGE_FLAG]) {
    return;
  }

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
      if (!hasChromeRuntime()) {
        postToPage({
          type: 'BOOKHUB_START_SYNC_RESULT',
          payload: { ok: false, error: 'extension runtime is unavailable' },
        });
        return;
      }

      try {
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
      } catch (error) {
        postToPage({
          type: 'BOOKHUB_START_SYNC_RESULT',
          payload: { ok: false, error: error instanceof Error ? error.message : 'failed to open kindle tab' },
        });
      }
    }
  };

  try {
    window.addEventListener('message', onMessage);
    win[BRIDGE_FLAG] = true;
  } catch (error) {
    console.warn('[HONS] failed to initialize dashboard bridge', error);
  }
}
