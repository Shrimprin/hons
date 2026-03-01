import type { BookMetadata } from '@bookhub/shared/types/book';

interface OwnershipBarProps {
  book: BookMetadata | null;
  loading: boolean;
}

function statusLabel(book: BookMetadata | null, loading: boolean): string {
  if (loading) return '確認中';
  if (!book) return '未連携';
  return '未所持';
}

export function OwnershipBar({ book, loading }: OwnershipBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2147483647,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        padding: '8px 16px',
        fontSize: '13px',
        lineHeight: 1.5,
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Hiragino Sans","Noto Sans JP",sans-serif',
        background: '#111827',
        color: '#f9fafb',
        borderBottom: '1px solid #1f2937',
        boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
      }}
    >
      <strong style={{ whiteSpace: 'nowrap' }}>HONS</strong>
      <span style={{ whiteSpace: 'nowrap' }}>所持: {statusLabel(book, loading)}</span>
      <span
        title={book?.title ?? 'タイトル未検出'}
        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        書名: {book?.title ?? 'タイトル未検出'}
      </span>
      <span style={{ whiteSpace: 'nowrap' }}>巻: {book?.volume ?? '-'}</span>
    </div>
  );
}
