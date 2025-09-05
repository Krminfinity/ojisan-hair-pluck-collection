
"use client";
import { useEffect, useState } from "react";
import { useGameStore } from "@/store/gameStore";
import OjisanImage from '@/components/OjisanImage';
import { HairPluckArea } from '@/components/HairPluckArea';
import { createOjisanPrompt } from "@/lib/ojisanPrompt";

export default function GamePage() {
  const { 
    currentOjisan, 
    setOjisan,
    isGenerating, 
    generateProgress, 
    generateMessage,
    setGenerating,
    collection,
    addToCollection 
  } = useGameStore();
  
  const [error, setError] = useState<string>('');

  const generateOjisan = async () => {
    if (isGenerating) return;
    
    setGenerating(true, 0, "おじさん生成中...");
    setError('');
    
    const { prompt, negative_prompt } = createOjisanPrompt({});
    
    try {
      // 進捗シミュレーション
      const progressSteps = [
        { progress: 0, message: "おじさん生成中..." },
        { progress: 25, message: "顔の特徴を決定しています..." },
        { progress: 50, message: "髪の毛を生やしています..." },
        { progress: 75, message: "画像を最適化しています..." },
        { progress: 90, message: "最終仕上げ中..." }
      ];

      for (const step of progressSteps) {
        setGenerating(true, step.progress, step.message);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const res = await fetch("/api/ojisans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, negative_prompt })
      });
      
      const data = await res.json();
      
      if (data.success && data.data?.imageBase64) {
        const imgUrl = `data:${data.data.contentType};base64,${data.data.imageBase64}`;
        
        const newOjisan = {
          id: `ojisan-${Date.now()}`,
          originalImageUrl: imgUrl,
          currentImageUrl: imgUrl,
          hairs: [] // 髪の毛は後で生成
        };

        setOjisan(newOjisan);
        setGenerating(false, 100, "生成完了！");
        
      } else {
        throw new Error(data.error?.message || "生成に失敗しました");
      }
      
    } catch (e: unknown) {
      console.error('Ojisan generation error:', e);
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
      setGenerating(false, 0, "");
    }
  };

  const handleHairPlucked = (updatedOjisan: typeof currentOjisan) => {
    if (!updatedOjisan) return;
    
    setOjisan(updatedOjisan);
    
    // 全部抜けたかチェック
    const allPlucked = updatedOjisan.hairs.every(h => h.isPlucked);
    if (allPlucked && updatedOjisan.hairs.length > 0) {
      // コレクションに追加
      addToCollection(updatedOjisan);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🧔 おじさんコレクション 🧔
        </h1>
        <p className="text-gray-600">
          AIで生成されたおじさんの髪の毛を抜いてコレクションしよう！
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* おじさん生成エリア */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">おじさん生成</h2>
          
          <button
            onClick={generateOjisan}
            disabled={isGenerating}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-4"
          >
            {isGenerating ? 'generating...' : '新しいおじさんを生成'}
          </button>

          {/* 進捗表示 */}
          {isGenerating && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${generateProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{generateMessage}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {currentOjisan && !isGenerating && (
            <div className="text-center">
              <OjisanImage src={currentOjisan.currentImageUrl} alt="おじさん画像" />
            </div>
          )}
        </div>

        {/* 髪抜きエリア */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">髪の毛を抜こう！</h2>
          
          {currentOjisan ? (
            <div>
              <HairPluckArea 
                ojisan={currentOjisan} 
                onHairPlucked={handleHairPlucked}
              />
              
              {/* コンプリートメッセージ */}
              {currentOjisan.hairs.length > 0 && currentOjisan.hairs.every(h => h.isPlucked) && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                  <div className="text-2xl font-bold animate-bounce mb-2">🎉 完全にハゲました！ 🎉</div>
                  <p>このおじさんがコレクションに追加されました</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">🧔</div>
                <p>まずはおじさんを生成してください</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* コレクション表示 */}
      {collection.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">コレクション ({collection.length}体)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {collection.map((ojisan) => (
              <div key={ojisan.id} className="text-center">
                <div className="w-full h-32 bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={ojisan.currentImageUrl} 
                    alt="コレクションされたおじさん"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">完全ハゲ</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
