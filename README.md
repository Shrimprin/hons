# HONS Monorepo

HONS の技術検証用モノレポです。

## 動作要件

- Node.js
- pnpm


> このリポジトリは `pnpm` 前提です。`npm` や `yarn` は使用しないでください。

## セットアップ手順

1. 依存関係をインストール

```bash
pnpm install
```

2. 拡張機能も含めて動作確認する

- ターミナルAで Web を起動

```bash
pnpm dev
```

- ターミナルBで拡張機能ビルド（`dist` を更新し続ける）

```bash
pnpm dev:extension
```

- Chrome の `chrome://extensions` を開き、デベロッパーモードを ON
- 「パッケージ化されていない拡張機能を読み込む」から `extension/dist` を選択
- `http://localhost:3000` を開いて同期ボタンから動作確認

## リポジトリ構成

- `web/`: Next.js (App Router) ダッシュボード
  - `web/src/app`: ルーティングとレイアウト
  - `web/src/components`: UI コンポーネント
  - `web/src/lib`: ユーティリティ関数
- `extension/`: Vite + React + CRXJS 拡張機能プロトタイプ
- `shared/`: 共通型・ユーティリティ

## よく使うコマンド

- Web 開発サーバー: `pnpm dev:web`
- 拡張機能開発ビルド（Chromeに読み込む `dist` を自動更新）: `pnpm dev:extension`
- 拡張機能本番ビルド: `pnpm build:extension`
- ワークスペース一括 typecheck: `pnpm typecheck`
- ワークスペース一括 lint & format: `pnpm fix`
- ワークスペース一括 test: `pnpm test`
- 各レポジトリに対してライブラリをインストール: `pnpm --filter @hons/{web, extension shared} add {ライブラリ名}`
