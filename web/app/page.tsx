import { extractVolume } from '@bookhub/shared/utils/volume';

const sampleTitle = 'ダンジョン飯 14巻';

export default function Home() {
  const volume = extractVolume(sampleTitle);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-12 sm:px-10">
      <h1 className="text-3xl font-bold tracking-tight">BookHub 技術検証</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        複数ストアの蔵書管理を統合するため、モノレポ構成と共有ユーティリティの土台を用意しています。
      </p>
      <section className="rounded-lg border p-4">
        <h2 className="mb-2 text-lg font-semibold">共有ユーティリティ検証</h2>
        <p className="text-sm">タイトル: {sampleTitle}</p>
        <p className="text-sm">抽出巻数: {volume ?? '未検出'}</p>
      </section>
    </main>
  );
}
