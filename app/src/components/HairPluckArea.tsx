"use client";
import React, { useRef, useEffect, useState } from 'react';
import { OjisanData } from '@/store/gameStore';
import { ImageProcessor } from '@/lib/imageProcessor';

interface HairPluckAreaProps {
  ojisan: OjisanData;
  onHairPlucked: (updatedOjisan: OjisanData) => void;
}

export const HairPluckArea: React.FC<HairPluckAreaProps> = ({
  ojisan,
  onHairPlucked
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageProcessor, setImageProcessor] = useState<ImageProcessor | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ojisan) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      // キャンバスサイズを画像に合わせる
      canvas.width = img.width;
      canvas.height = img.height;
      
      // ImageProcessorを初期化
      const processor = new ImageProcessor(canvas);
      setImageProcessor(processor);
      
      // 初回は元の画像を描画
      ctx.drawImage(img, 0, 0);
      
      // 髪の毛のポイントがまだ生成されていない場合は生成
      if (ojisan.hairs.length === 0) {
        const hairPoints = processor.generateHairPoints(img, 150); // 150個の髪の毛ポイント
        const updatedOjisan = {
          ...ojisan,
          hairs: hairPoints
        };
        onHairPlucked(updatedOjisan);
      } else {
        // 既に抜かれた髪がある場合は、現在の状態を再描画
        await redrawWithPluckedHairs(processor, img, ojisan);
      }
    };

    img.src = ojisan.currentImageUrl;
  }, [ojisan.currentImageUrl]);

  const redrawWithPluckedHairs = async (processor: ImageProcessor, img: HTMLImageElement, currentOjisan: OjisanData) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 元の画像を描画
    ctx.drawImage(img, 0, 0);
    
    // 抜かれた髪の毛の領域にマスクを適用
    const pluckedHairs = currentOjisan.hairs.filter(h => h.isPlucked);
    if (pluckedHairs.length > 0) {
      for (const hair of pluckedHairs) {
        processor.createHairMask(hair.x, hair.y, hair.radius);
      }
    }
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!imageProcessor || isProcessing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // 近くの髪の毛を探す
    const nearbyHair = ojisan.hairs.find(hair => {
      const distance = Math.sqrt((hair.x - x) ** 2 + (hair.y - y) ** 2);
      return !hair.isPlucked && distance <= hair.radius;
    });

    if (nearbyHair) {
      pluckHair(nearbyHair);
    }
  };

  const pluckHair = async (hair: typeof ojisan.hairs[0]) => {
    if (!imageProcessor || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // 髪の毛を抜く（マスクを適用）
      imageProcessor.createHairMask(hair.x, hair.y, hair.radius);
      
      // 状態を更新
      const updatedHairs = ojisan.hairs.map(h => 
        h.id === hair.id ? { ...h, isPlucked: true } : h
      );
      
      // 現在の画像データを取得してcurrentImageUrlを更新
      const canvas = canvasRef.current;
      if (canvas) {
        const currentImageUrl = canvas.toDataURL('image/png');
        const updatedOjisan = {
          ...ojisan,
          hairs: updatedHairs,
          currentImageUrl
        };
        onHairPlucked(updatedOjisan);
      }
    } catch (error) {
      console.error('髪の毛を抜く処理でエラーが発生しました:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        className="max-w-full h-auto cursor-pointer border-2 border-gray-300 rounded-lg"
        style={{ touchAction: 'none' }}
      />
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="text-white font-bold">処理中...</div>
        </div>
      )}
      <div className="mt-2 text-sm text-gray-600">
        残り髪の毛: {ojisan.hairs.filter(h => !h.isPlucked).length} / {ojisan.hairs.length}
      </div>
    </div>
  );
};
