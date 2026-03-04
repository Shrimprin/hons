import {
  MESSAGE_TYPE,
  SOURCE,
  type DashboardRequestMessage,
  type ExtensionMessage,
  type KindleLibrarySnapshot,
} from '@bookhub/shared';
import { OPEN_KINDLE_SYNC_TAB_MESSAGE, type OpenKindleSyncTabResponse } from './messages';

const SNAPSHOT_KEY = 'bookhubKindleLibrarySnapshot';
const BRIDGE_FLAG = '__honsBridgeInitialized__';

function postToPage(payload: Omit<ExtensionMessage, 'source'>) {
  window.postMessage(
    {
      source: SOURCE.EXTENSION,
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

async function getSnapshot(): Promise<KindleLibrarySnapshot | null> {
  if (!hasChromeStorage()) return null;
  try {
    const stored = await chrome.storage.local.get(SNAPSHOT_KEY);
    return (stored[SNAPSHOT_KEY] as KindleLibrarySnapshot | null | undefined) ?? null;
  } catch {
    return null;
  }
}

export function initializeWebDashboardBridge() {
  const win = window as Window & { __honsBridgeInitialized__?: boolean };
  if (win[BRIDGE_FLAG]) {
    return;
  }

  const onMessage = (event: MessageEvent<DashboardRequestMessage>) => {
    if (event.source !== window) return;
    if (event.origin !== window.location.origin) return;
    if (event.data?.source !== SOURCE.WEB) return;

    if (event.data.type === MESSAGE_TYPE.GET_SNAPSHOT) {
      void getSnapshot().then((snapshot) => {
        postToPage({ type: MESSAGE_TYPE.SNAPSHOT, payload: snapshot });
      });
      return;
    }

    if (event.data.type === MESSAGE_TYPE.START_SYNC) {
      if (!hasChromeRuntime()) {
        postToPage({
          type: MESSAGE_TYPE.START_SYNC_RESULT,
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
              type: MESSAGE_TYPE.START_SYNC_RESULT,
              payload: response,
            });
          })
          .catch((error: unknown) => {
            postToPage({
              type: MESSAGE_TYPE.START_SYNC_RESULT,
              payload: { ok: false, error: error instanceof Error ? error.message : 'failed to open kindle tab' },
            });
          });
      } catch (error) {
        postToPage({
          type: MESSAGE_TYPE.START_SYNC_RESULT,
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
