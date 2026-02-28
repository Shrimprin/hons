# hons

`Next.js`（App Router）ベースの Web アプリケーションです。  
UI は Tailwind CSS + shadcn/ui を利用し、コード品質管理として ESLint / Prettier / Vitest / CI を導入しています。

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

2. 開発サーバーを起動

```bash
pnpm dev
```

3. ブラウザで確認  
   `http://localhost:3000`

## よく使うコマンド

- 開発サーバー: `pnpm dev`
- 本番ビルド: `pnpm build`
- 本番起動: `pnpm start`
- Lint: `pnpm lint`
- Lint 自動修正: `pnpm lint:fix`
- Format: `pnpm format`
- Format チェック: `pnpm format:check`
- Test: `pnpm test`
- Test(Watch): `pnpm test:watch`
- 一括修正: `pnpm fix`
