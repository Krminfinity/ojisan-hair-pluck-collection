// 画像処理ユーティリティ
export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not found');
    }
    this.ctx = ctx;
  }

  // 髪の毛を抜いた部分にマスクを適用
  createHairMask(x: number, y: number, radius: number): void {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    
    // 肌色のグラデーション
    const gradient = this.ctx.createRadialGradient(
      x, y, 0,
      x, y, radius
    );
    gradient.addColorStop(0, '#f4c2a1'); // 中心の肌色
    gradient.addColorStop(0.7, '#e8a57c'); // 中間の肌色
    gradient.addColorStop(1, '#d4956b'); // 外側の肌色
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  // 髪の毛のポイントを生成
  generateHairPoints(img: HTMLImageElement, count: number): Array<{id: string, x: number, y: number, radius: number, isPlucked: boolean}> {
    const hairPoints: Array<{id: string, x: number, y: number, radius: number, isPlucked: boolean}> = [];
    
    // 画像の上半分（髪の毛がありそうな領域）を対象にする
    const hairRegionHeight = img.height * 0.6; // 上から60%の領域
    
    for (let i = 0; i < count; i++) {
      hairPoints.push({
        id: `hair-${i}`,
        x: Math.random() * img.width,
        y: Math.random() * hairRegionHeight,
        radius: 8 + Math.random() * 8, // 8-16pxの半径
        isPlucked: false
      });
    }
    
    return hairPoints;
  }
}
