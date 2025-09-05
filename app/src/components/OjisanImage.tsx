"use client";
import React from "react";

export default function OjisanImage({ src, alt }: { src: string; alt?: string }) {
  return (
    <div className="w-64 h-64 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
      {/* TODO: AI生成画像を表示。現状はダミー画像 */}
      <img
        src={src}
        alt={alt || "おじさん画像"}
        className="object-cover w-full h-full"
        draggable={false}
      />
    </div>
  );
}
