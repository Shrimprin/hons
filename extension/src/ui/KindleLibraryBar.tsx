import type { KindleLibraryBook } from "../lib/extractKindleLibrary";

interface KindleLibraryBarProps {
  count: number;
  books: KindleLibraryBook[];
  onRefresh: () => void;
  onCopyJson: () => void;
}

export function KindleLibraryBar({ count, books, onRefresh, onCopyJson }: KindleLibraryBarProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 14px",
        background: "#0f172a",
        color: "#e2e8f0",
        fontSize: "13px",
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,"Hiragino Sans","Noto Sans JP",sans-serif',
        borderBottom: "1px solid #1e293b",
      }}
    >
      <strong>BookHub</strong>
      <span>Kindleライブラリ取得: {count}件</span>
      <button
        onClick={onRefresh}
        style={{
          border: "1px solid #334155",
          background: "#1e293b",
          color: "#e2e8f0",
          borderRadius: "6px",
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        再取得
      </button>
      <button
        onClick={onCopyJson}
        style={{
          border: "1px solid #334155",
          background: "#1e293b",
          color: "#e2e8f0",
          borderRadius: "6px",
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        JSONコピー
      </button>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        先頭: {books[0]?.title ?? "未取得"}
      </span>
    </div>
  );
}
