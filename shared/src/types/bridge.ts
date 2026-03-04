export const SOURCE = {
  WEB: 'bookhub-web',
  EXTENSION: 'bookhub-extension',
} as const;

export const MESSAGE_TYPE = {
  GET_SNAPSHOT: 'BOOKHUB_GET_SNAPSHOT',
  START_SYNC: 'BOOKHUB_START_SYNC',
  SNAPSHOT: 'BOOKHUB_SNAPSHOT',
  START_SYNC_RESULT: 'BOOKHUB_START_SYNC_RESULT',
  SYNC_FINISHED: 'BOOKHUB_SYNC_FINISHED',
} as const;

export type KindleBookSnapshotItem = {
  title: string;
  asin: string | null;
  imageUrl: string | null;
  detailUrl?: string | null;
};

export type KindleLibrarySnapshot = {
  takenAt: string;
  url: string;
  total: number;
  books: KindleBookSnapshotItem[];
};

export type DashboardRequestType = typeof MESSAGE_TYPE.GET_SNAPSHOT | typeof MESSAGE_TYPE.START_SYNC;

export type DashboardRequestMessage = {
  source: typeof SOURCE.WEB;
  type: DashboardRequestType;
};

export type ExtensionSnapshotMessage = {
  source: typeof SOURCE.EXTENSION;
  type: typeof MESSAGE_TYPE.SNAPSHOT;
  payload: KindleLibrarySnapshot | null;
};

export type StartSyncResultPayload = {
  ok: boolean;
  tabId?: number;
  error?: string;
};

export type StartSyncResultMessage = {
  source: typeof SOURCE.EXTENSION;
  type: typeof MESSAGE_TYPE.START_SYNC_RESULT;
  payload: StartSyncResultPayload;
};

export type SyncFinishedPayload = {
  success: boolean;
  total?: number;
  error?: string;
};

export type SyncFinishedMessage = {
  source: typeof SOURCE.EXTENSION;
  type: typeof MESSAGE_TYPE.SYNC_FINISHED;
  payload: SyncFinishedPayload;
};

export type ExtensionMessage = ExtensionSnapshotMessage | StartSyncResultMessage | SyncFinishedMessage;
