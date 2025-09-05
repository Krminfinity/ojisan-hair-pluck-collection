"use client";
import React, { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";

// 髪の毛をCanvasで描画し、ドラッグで抜けるインタラクション
export default function HairPluckArea() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    currentOjisan,
    selectedHairId,
    isDragging,
    dragStart,
    dragCurrent,
    pluckHair,
    selectHair,
    startDrag,
    updateDrag,
    endDrag,
  } = useGameStore();

  // 髪の毛クリック判定
  const detectHairAt = (x: number, y: number) => {
    if (!currentOjisan) return null;
    // 簡易: 円形ヒット判定
    return currentOjisan.hairs.find(
      (h) =>
        !h.isPlucked &&
        Math.hypot(h.x - x, h.y - y) < 16 // 16px以内
    );
  };

  // Canvas描画
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !currentOjisan) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 髪の毛描画
    currentOjisan.hairs.forEach((hair) => {
      ctx.save();
      ctx.translate(hair.x, hair.y);
      ctx.rotate(hair.angle);
      ctx.strokeStyle = hair.isPlucked ? "#bbb" : "#222";
      ctx.lineWidth = hair.thickness;
      ctx.globalAlpha = hair.isPlucked ? 0.2 : 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -hair.length);
      ctx.stroke();
      ctx.restore();
    });
  }, [currentOjisan]);

  // マウス・タッチイベント
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!currentOjisan) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const hair = detectHairAt(x, y);
    if (hair) {
      selectHair(hair.id);
      startDrag(x, y);
    }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStart || !selectedHairId) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    updateDrag(x, y);
    // 引っ張り距離で抜ける判定
    const dist = Math.hypot(x - dragStart.x, y - dragStart.y);
    if (dist > 40) {
      pluckHair(selectedHairId);
      endDrag();
      // サウンド・バイブ
      if (typeof window !== "undefined") {
        if (window.navigator.vibrate) window.navigator.vibrate([80]);
        const audio = new Audio("/pluck.mp3");
        audio.play();
      }
    }
  };
  const handlePointerUp = () => {
    endDrag();
  };

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={120}
      className="bg-transparent touch-none select-none"
      style={{ border: "none", width: 300, height: 120, display: "block" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}
