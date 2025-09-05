
"use client";
import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import OjisanImage from "@/components/OjisanImage";
import HairPluckArea from "@/components/HairPluckArea";
import { createOjisanPrompt } from "@/lib/ojisanPrompt";

export default function GamePage() {
  const setOjisan = useGameStore((s) => s.setOjisan);
  const [ojisanImg, setOjisanImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // おじさん生成API呼び出し
  const generateOjisan = async () => {
    setLoading(true);
    setError(null);
    const { prompt, negative_prompt } = createOjisanPrompt({});
    try {
      const res = await fetch("/api/ojisans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, negative_prompt })
      });
      const data = await res.json();
      if (data.success && data.data?.imageBase64) {
        const imgUrl = `data:${data.data.contentType};base64,${data.data.imageBase64}`;
        setOjisanImg(imgUrl);
        // 髪の毛もランダム生成
        const hairs = Array.from({ length: 20 }).map((_, i) => ({
          id: `hair${i}`,
          x: 50 + Math.random() * 200,
          y: 80 + Math.random() * 30,
          angle: (Math.random() - 0.5) * 0.5,
          thickness: 2 + Math.random() * 2,
          length: 30 + Math.random() * 30,
          isPlucked: false,
        }));
        setOjisan({
          id: "generated-ojisan",
          imageUrl: imgUrl,
          hairs,
        });
      } else {
        setError(data.error?.message || "生成に失敗しました");
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // 初回はダミー画像
  useEffect(() => {
    if (!ojisanImg) {
      const hairs = Array.from({ length: 20 }).map((_, i) => ({
        id: `hair${i}`,
        x: 50 + Math.random() * 200,
        y: 80 + Math.random() * 30,
        angle: (Math.random() - 0.5) * 0.5,
        thickness: 2 + Math.random() * 2,
        length: 30 + Math.random() * 30,
        isPlucked: false,
      }));
      setOjisan({
        id: "dummy-ojisan",
        imageUrl: "https://placehold.jp/300x300.png",
        hairs,
      });
    }
  }, [ojisanImg, setOjisan]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <header className="mb-8 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">髪抜きゲーム</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">おじさんの髪を抜いてコレクションしよう！</p>
      </header>
      <main className="w-full max-w-xl bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-8 flex flex-col gap-6 items-center">
        <OjisanImage src={ojisanImg || "https://placehold.jp/300x300.png"} alt="おじさん画像" />
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-full text-base shadow transition mb-2"
          onClick={generateOjisan}
          disabled={loading}
        >
          {loading ? "生成中..." : "おじさん生成AIで新しいおじさんを作る"}
        </button>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <div className="w-full flex flex-col items-center">
          <HairPluckArea />
        </div>
      </main>
    </div>
  );
}
