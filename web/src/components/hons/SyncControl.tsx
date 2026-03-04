import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type SyncStatus = 'idle' | 'syncing' | 'completed';

type SyncControlsProps = {
  syncStatus: SyncStatus;
  statusText: string;
  onStartSync: () => void;
  onRefreshSnapshot: () => void;
};

export function SyncControls({ syncStatus, statusText, onStartSync, onRefreshSnapshot }: SyncControlsProps) {
  const isSyncing = syncStatus === 'syncing';
  const isRefreshMode = syncStatus === 'completed';
  const buttonLabel = isSyncing ? '同期中...' : isRefreshMode ? 'スナップショット再取得' : 'Kindle 同期を開始';

  return (
    <Card>
      <CardHeader>
        <CardTitle>同期コントロール</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={isRefreshMode ? onRefreshSnapshot : onStartSync} disabled={isSyncing}>
          {buttonLabel}
        </Button>
        <span className="text-sm text-zinc-600 dark:text-zinc-300">{statusText}</span>
      </CardContent>
    </Card>
  );
}
