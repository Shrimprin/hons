# BookHub Monorepo

BookHub の技術検証用モノレポです。Web ダッシュボードとブラウザ拡張機能が同一リポジトリで共存し、`shared/` で型やロジックを共有します。

## 動作要件

- Node.js: `20.x` 以上（CI は Node 20 で実行）
- pnpm: `10.27.0`（`packageManager` で固定）
- OS: macOS / Linux / Windows(WSL2) 想定

> このリポジトリは `pnpm` 前提です。`npm` や `yarn` は使用しないでください。

## セットアップ手順

1. 依存関係をインストール

```bash
pnpm install
```

2. Web 開発サーバーを起動

```bash
pnpm dev
```

3. ブラウザで確認  
   `http://localhost:3000`

## リポジトリ構成

- `web/`: Next.js (App Router) ダッシュボード
- `extension/`: Vite + React + CRXJS 拡張機能プロトタイプ
- `shared/`: 共通型・ユーティリティ

## よく使うコマンド

- Web 開発サーバー: `pnpm dev`
- Web ビルド: `pnpm build:web`
- 拡張機能開発ビルド（Chromeに読み込む `dist` を自動更新）: `pnpm dev:extension`
- 拡張機能ホットリロード開発（`localhost:5173` 必須）: `pnpm dev:extension:hot`
- 拡張機能本番ビルド: `pnpm build:extension`
- ワークスペース一括 typecheck: `pnpm typecheck`
- ワークスペース一括 lint: `pnpm lint`
- ワークスペース一括 test: `pnpm test`
- 各レポジトリに対してライブラリをインストール: `pnpm --filter @hons/web add date-fns`
