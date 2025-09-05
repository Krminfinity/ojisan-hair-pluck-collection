export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-bold mb-2">おじさんコレクション</h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">AIで生成されたおじさんの髪を抜いてコレクション！</p>
      </header>
      <main className="w-full max-w-xl bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-8 flex flex-col gap-6">
        <section>
          <h2 className="text-xl font-semibold mb-2">主な特徴</h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-200 space-y-1">
            <li>AI生成おじさん（Hugging Face API）</li>
            <li>リアルな髪抜き体験（物理エンジン）</li>
            <li>コレクション・ランキング・レアリティ</li>
            <li>バイブレーション・サウンドエフェクト</li>
            <li>完全無料・レスポンシブ対応</li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">今後のアップデート</h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-200 space-y-1">
            <li>AI生成機能の実装</li>
            <li>髪抜きゲームエンジン開発</li>
            <li>コレクション・ランキング機能</li>
          </ol>
        </section>
        <div className="flex justify-center mt-6">
          <a href="/game">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow transition">はじめる</button>
          </a>
        </div>
      </main>
      <footer className="mt-10 text-gray-500 text-sm">&copy; 2025 おじさんコレクション</footer>
    </div>
  );
}
