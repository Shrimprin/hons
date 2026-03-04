import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SyncControlsProps {
  loading: boolean;
  statusText: string;
  onStartSync: () => void;
  onRefreshSnapshot: () => void;
}

export function SyncControls({ loading, statusText, onStartSync, onRefreshSnapshot }: SyncControlsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>同期コントロール</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={onStartSync} disabled={loading}>
          {loading ? '開始中...' : 'Kindle 同期を開始'}
        </Button>
        <Button variant="outline" onClick={onRefreshSnapshot}>
          スナップショット再取得
        </Button>
        <span className="text-sm text-zinc-600 dark:text-zinc-300">{statusText}</span>
      </CardContent>
    </Card>
  );
}
