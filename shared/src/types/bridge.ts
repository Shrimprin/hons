export const SOURCE = {
  WEB: 'hons-web',
  EXTENSION: 'hons-extension',
} as const;

export const MESSAGE_TYPE = {
  GET_SNAPSHOT: 'HONS_GET_SNAPSHOT',
  START_SYNC: 'HONS_START_SYNC',
  SNAPSHOT: 'HONS_SNAPSHOT',
  START_SYNC_RESULT: 'HONS_START_SYNC_RESULT',
  SYNC_FINISHED: 'HONS_SYNC_FINISHED',
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
