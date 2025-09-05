import { NextRequest, NextResponse } from "next/server";

// Hugging Face高品質モデル
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;

export async function POST(req: NextRequest) {
  if (!HF_API_KEY) {
    return NextResponse.json({ success: false, error: { code: "NO_API_KEY", message: "Hugging Face APIキーが未設定です" } }, { status: 500 });
  }
  const body = await req.json();
  // パラメータ例: { prompt: string, negative_prompt?: string, seed?: number }
  const { prompt, negative_prompt, seed } = body;
  if (!prompt) {
    return NextResponse.json({ success: false, error: { code: "NO_PROMPT", message: "プロンプトが必要です" } }, { status: 400 });
  }
  try {
    const response = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt,
          seed,
          guidance_scale: 9.0, // 高品質化（7.5→9.0）
          num_inference_steps: 50, // 高品質化（30→50）
          width: 768, // 高解像度化（512→768）
          height: 768 // 高解像度化（512→768）
        }
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json({ success: false, error: { code: "HF_ERROR", message: err.error || "Hugging Face APIエラー" } }, { status: 500 });
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.startsWith("image/")) {
      // 画像バイナリをbase64で返す
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return NextResponse.json({ success: true, data: { imageBase64: base64, contentType } });
    } else {
      const data = await response.json();
      return NextResponse.json({ success: false, error: { code: "NO_IMAGE", message: data.error || "画像生成に失敗" } }, { status: 500 });
    }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ success: false, error: { code: "EXCEPTION", message } }, { status: 500 });
  }
}
