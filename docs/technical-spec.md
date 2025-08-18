# おじさんコレクション - 技術仕様書

## 1. システム構成図

```
[Client App (React/Next.js)]
       ↓ HTTPS
[Load Balancer (CloudFlare)]
       ↓
[Web Server (Vercel/Next.js)]
       ↓
[API Gateway]
       ↓
┌─────────────────┬──────────────────┬─────────────────┐
│   AI Service    │   Game Logic     │   User Service  │
│   (画像生成)    │   (ゲーム管理)   │   (ユーザー管理) │
└─────────────────┴──────────────────┴─────────────────┘
       ↓                 ↓                    ↓
[Hugging Face API] [MongoDB Atlas]    [Auth Service]
       ↓                 ↓                    ↓
[Cloudinary/Firebase] [Redis Cache]   [Session Store]
```

## 2. データベース設計

### 2.1 コレクション構造 (MongoDB)

#### Users Collection
```json
{
  "_id": "ObjectId",
  "userId": "string (unique)",
  "username": "string",
  "email": "string",
  "createdAt": "Date",
  "lastLoginAt": "Date",
  "totalOjisans": "number",
  "preferences": {
    "difficulty": "easy|normal|hard",
    "soundEnabled": "boolean",
    "vibrationEnabled": "boolean"
  },
  "stats": {
    "totalPlayTime": "number (seconds)",
    "fastestCompletion": "number (seconds)",
    "totalHairPlucked": "number"
  }
}
```

#### Ojisans Collection (テンプレート/マスターデータ)
```json
{
  "_id": "ObjectId",
  "templateId": "string (unique)",
  "rarity": "normal|rare|super_rare",
  "generationPrompt": "string",
  "imageUrl": "string",
  "hairMap": {
    "totalHairs": "number",
    "regions": [
      {
        "regionId": "string",
        "regionName": "string (top|side|back)",
        "hairs": [
          {
            "hairId": "string",
            "x": "number",
            "y": "number",
            "thickness": "number (1-5)",
            "resistance": "number (1-10)",
            "color": "string"
          }
        ]
      }
    ]
  },
  "metadata": {
    "age": "number",
    "style": "string",
    "tags": ["string"]
  },
  "createdAt": "Date"
}
```

#### User_Ojisans Collection (ユーザーの進行状況)
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "ojisanTemplateId": "string",
  "status": "in_progress|completed",
  "startedAt": "Date",
  "completedAt": "Date",
  "currentProgress": {
    "pluckedHairs": ["string"], // hairId array
    "totalPlucked": "number",
    "totalHairs": "number",
    "progressPercentage": "number"
  },
  "completionStats": {
    "timeToComplete": "number (seconds)",
    "difficulty": "string",
    "score": "number"
  }
}
```

#### Game_Sessions Collection
```json
{
  "_id": "ObjectId",
  "userId": "string",
  "ojisanId": "string",
  "sessionStartAt": "Date",
  "sessionEndAt": "Date",
  "actions": [
    {
      "actionType": "hair_pluck|hair_attempt",
      "hairId": "string",
      "timestamp": "Date",
      "success": "boolean",
      "coords": {"x": "number", "y": "number"}
    }
  ]
}
```

## 3. API設計

### 3.1 REST API エンドポイント

#### Authentication
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
```

#### Ojisan Management
```
POST /api/ojisans/generate          # 新しいおじさん生成
GET  /api/ojisans/current          # 現在のおじさん取得
GET  /api/ojisans/:id              # 特定のおじさん取得
POST /api/ojisans/:id/start        # おじさんでゲーム開始
```

#### Game Actions
```
POST /api/game/pluck-hair          # 髪の毛を抜く
GET  /api/game/progress/:sessionId # 進捗取得
POST /api/game/complete/:sessionId # ゲーム完了
```

#### Collection
```
GET  /api/collection               # ユーザーのコレクション取得
GET  /api/collection/stats         # 統計情報取得
POST /api/collection/share/:id     # コレクションシェア
```

#### Leaderboard
```
GET  /api/leaderboard/time         # 時間ランキング
GET  /api/leaderboard/collection   # コレクション数ランキング
```

### 3.2 API レスポンス例

#### POST /api/ojisans/generate
```json
{
  "success": true,
  "data": {
    "ojisan": {
      "id": "ojisan_123",
      "imageUrl": "https://res.cloudinary.com/ojisan-collection/ojisan_123.png",
      "rarity": "normal",
      "generationTime": 45.2,
      "quality": "high",
      "hairMap": {
        "totalHairs": 2847,
        "regions": [...]
      },
      "metadata": {
        "age": 45,
        "style": "businessman",
        "estimatedTime": "8-12 minutes"
      }
    }
  }
}
```

#### POST /api/game/pluck-hair
```json
{
  "success": true,
  "data": {
    "hairRemoved": true,
    "newProgress": {
      "totalPlucked": 1256,
      "totalHairs": 2847,
      "progressPercentage": 44.1
    },
    "effects": {
      "sound": "pluck_success",
      "vibration": "light",
      "score": 10
    }
  }
}
```

## 4. フロントエンド設計

### 4.1 コンポーネント構造

```
src/
├── components/
│   ├── game/
│   │   ├── OjisanCanvas.tsx       # メインゲーム画面
│   │   ├── HairRenderer.tsx       # 髪の毛レンダリング
│   │   ├── ProgressBar.tsx        # 進捗表示
│   │   └── EffectsManager.tsx     # エフェクト管理
│   ├── collection/
│   │   ├── CollectionGrid.tsx     # コレクション一覧
│   │   ├── OjisanCard.tsx        # おじさんカード
│   │   └── StatsPanel.tsx        # 統計パネル
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Layout.tsx
├── pages/
│   ├── index.tsx                  # ホーム画面
│   ├── game.tsx                   # ゲーム画面
│   ├── collection.tsx             # コレクション画面
│   └── leaderboard.tsx           # ランキング画面
├── hooks/
│   ├── useGame.ts                # ゲームロジック
│   ├── useAudio.ts              # サウンド管理
│   ├── useVibration.ts          # バイブレーション
│   └── useCollection.ts         # コレクション管理
├── services/
│   ├── api.ts                   # API通信
│   ├── gameEngine.ts            # ゲームエンジン
│   └── audioManager.ts          # オーディオ管理
└── utils/
    ├── coordinates.ts           # 座標計算
    ├── physics.ts              # 物理計算
    └── storage.ts              # ローカルストレージ
```

### 4.2 主要コンポーネント

#### OjisanCanvas.tsx
```typescript
interface OjisanCanvasProps {
  ojisan: OjisanData;
  onHairPluck: (hairId: string, coords: {x: number, y: number}) => void;
  onComplete: () => void;
}

export const OjisanCanvas: React.FC<OjisanCanvasProps> = ({
  ojisan,
  onHairPluck,
  onComplete
}) => {
  // Canvas操作、髪の毛の描画、タッチイベント処理
  // Three.jsまたはCanvas APIを使用
};
```

#### useGame.ts
```typescript
export const useGame = (ojisanId: string) => {
  const [gameState, setGameState] = useState<GameState>();
  const [progress, setProgress] = useState<Progress>();
  
  const pluckHair = async (hairId: string, coords: Coordinates) => {
    // 髪の毛を抜く処理
    // API呼び出し、状態更新、エフェクト再生
  };
  
  const completeGame = async () => {
    // ゲーム完了処理
  };
  
  return { gameState, progress, pluckHair, completeGame };
};
```

## 5. AI画像生成の実装（無料リソース活用）

### 5.1 Hugging Face無料API活用

#### 5.1.1 モデル選択
```typescript
const AI_MODELS = {
  primary: "stabilityai/stable-diffusion-xl-base-1.0",
  fallback: "runwayml/stable-diffusion-v1-5",
  quality: "stabilityai/sdxl-turbo", // 高速生成用
};

const HF_CONFIG = {
  apiUrl: "https://api-inference.huggingface.co/models/",
  apiKey: process.env.HUGGING_FACE_API_KEY, // 無料アカウント
  maxRetries: 3,
  timeout: 120000, // 2分タイムアウト
};
```

#### 5.1.2 品質重視の生成戦略
```typescript
class QualityFocusedGenerator {
  async generateOjisan(params: GenerationParams): Promise<OjisanResult> {
    // 1. 高品質プロンプト生成
    const enhancedPrompt = this.createQualityPrompt(params);
    
    // 2. 複数候補生成（3-5枚）
    const candidates = await this.generateMultipleCandidates(enhancedPrompt);
    
    // 3. 品質評価・選択
    const bestCandidate = await this.selectBestImage(candidates);
    
    // 4. 後処理（アップスケール、ノイズ除去）
    const enhancedImage = await this.enhanceImage(bestCandidate);
    
    return {
      image: enhancedImage,
      metadata: this.extractMetadata(enhancedImage),
      generationTime: Date.now() - startTime
    };
  }
  
  private createQualityPrompt(params: GenerationParams): string {
    // 高品質化のためのプロンプトエンジニアリング
    const qualityModifiers = [
      "masterpiece, best quality, ultra detailed",
      "8k uhd, professional photography",
      "sharp focus, realistic lighting",
      "high resolution, photorealistic"
    ].join(", ");
    
    const negativePrompt = [
      "low quality, blurry, distorted",
      "cartoon, anime, drawing",
      "bad anatomy, deformed",
      "watermark, signature"
    ].join(", ");
    
    return {
      prompt: `${this.getBasePrompt(params)}, ${qualityModifiers}`,
      negative_prompt: negativePrompt,
      num_inference_steps: 30, // 品質重視
      guidance_scale: 7.5,
      width: 768,
      height: 768
    };
  }
}
```

### 5.2 無料リソース最適化

#### 5.2.1 API制限対策
```typescript
class RateLimitManager {
  private requestQueue: GenerationRequest[] = [];
  private lastRequestTime = 0;
  private readonly MIN_INTERVAL = 10000; // 10秒間隔
  
  async queueGeneration(request: GenerationRequest): Promise<string> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        ...request,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.requestQueue.length === 0) return;
    
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.MIN_INTERVAL) {
      // 待機時間を表示
      const waitTime = this.MIN_INTERVAL - timeSinceLastRequest;
      this.notifyWaitTime(waitTime);
      
      setTimeout(() => this.processQueue(), waitTime);
      return;
    }
    
    const request = this.requestQueue.shift()!;
    this.lastRequestTime = now;
    
    try {
      const result = await this.executeGeneration(request);
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    }
    
    // 次のリクエストを処理
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), this.MIN_INTERVAL);
    }
  }
}
```

#### 5.2.2 キャッシュ戦略
```typescript
class ImageCacheManager {
  private cache = new Map<string, CachedImage>();
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24時間
  
  async getCachedOrGenerate(promptHash: string, params: GenerationParams): Promise<string> {
    // キャッシュチェック
    const cached = this.cache.get(promptHash);
    if (cached && !this.isExpired(cached)) {
      return cached.imageUrl;
    }
    
    // 類似画像検索
    const similar = await this.findSimilarImage(params);
    if (similar) {
      return similar.imageUrl;
    }
    
    // 新規生成
    const newImage = await this.generateNew(params);
    this.cache.set(promptHash, {
      imageUrl: newImage,
      timestamp: Date.now(),
      params
    });
    
    return newImage;
  }
}
```

### 5.3 品質向上テクニック

#### 5.3.1 プロンプトエンジニアリング
```typescript
const generateOjisanPrompt = (params: GenerationParams): string => {
  const basePrompt = "A realistic portrait of a middle-aged Japanese businessman";
  
  // 年齢別詳細設定
  const ageDetails = {
    35: "youthful appearance, slight facial hair, energetic expression",
    45: "mature features, some wrinkles, confident demeanor", 
    55: "distinguished look, gray hair touches, wise expression"
  };
  
  // 髪型詳細設定
  const hairDetails = {
    full: "thick black hair, well-groomed, professional hairstyle",
    thinning: "naturally thinning hair, realistic male pattern baldness beginning",
    receding: "receding hairline, mature hairline pattern, authentic hair loss"
  };
  
  // 品質向上キーワード
  const qualityKeywords = [
    "studio portrait lighting",
    "85mm lens, shallow depth of field",
    "natural skin texture, pores visible",
    "authentic Japanese facial features",
    "professional headshot quality"
  ];
  
  return [
    basePrompt,
    ageDetails[params.age],
    hairDetails[params.hairType],
    ...qualityKeywords
  ].join(", ");
};
```

#### 5.3.2 後処理パイプライン
```typescript
class ImageEnhancer {
  async enhanceGenerated(imageUrl: string): Promise<string> {
    // 1. ノイズ除去
    const denoised = await this.removeNoise(imageUrl);
    
    // 2. シャープネス向上
    const sharpened = await this.enhanceSharpness(denoised);
    
    // 3. 色調補正
    const colorCorrected = await this.correctColors(sharpened);
    
    // 4. 最終的なクロップ・リサイズ
    const final = await this.finalizeImage(colorCorrected);
    
    return final;
  }
  
  private async removeNoise(imageUrl: string): Promise<string> {
    // Canvas APIまたは無料の画像処理ライブラリを使用
    // 例: Fabric.js, Konva.js等
  }
}
```

### 5.4 フォールバック戦略

#### 5.4.1 複数モデル対応
```typescript
class MultiModelGenerator {
  private models = [
    { id: "sdxl-base", priority: 1, quality: "highest" },
    { id: "sd-2-1", priority: 2, quality: "high" },
    { id: "sd-1-5", priority: 3, quality: "medium" }
  ];
  
  async generateWithFallback(params: GenerationParams): Promise<string> {
    for (const model of this.models) {
      try {
        const result = await this.tryGeneration(model, params);
        if (this.validateQuality(result)) {
          return result;
        }
      } catch (error) {
        console.log(`Model ${model.id} failed, trying next...`);
        continue;
      }
    }
    
    throw new Error("All models failed to generate acceptable image");
  }
}
```

### 5.5 ユーザー体験の向上

#### 5.5.1 生成進捗表示
```typescript
class GenerationProgressTracker {
  async trackGeneration(generationId: string): Promise<void> {
    const stages = [
      { name: "プロンプト最適化中...", duration: 2000 },
      { name: "AI画像生成中...", duration: 30000 },
      { name: "品質チェック中...", duration: 5000 },
      { name: "画像最適化中...", duration: 8000 },
      { name: "髪の毛マップ作成中...", duration: 10000 }
    ];
    
    for (const stage of stages) {
      this.updateProgress(generationId, stage.name);
      await this.sleep(stage.duration);
    }
  }
  
  private updateProgress(id: string, message: string) {
    // WebSocketまたはSSEでリアルタイム更新
    this.websocket.send({
      type: 'generation_progress',
      id,
      message,
      timestamp: Date.now()
    });
  }
}
```

#### 5.5.2 キューイング情報表示
```typescript
class QueueStatusManager {
  getQueueStatus(): QueueStatus {
    return {
      position: this.getCurrentPosition(),
      estimatedWaitTime: this.calculateWaitTime(),
      totalInQueue: this.requestQueue.length,
      message: this.getWaitMessage()
    };
  }
  
  private getWaitMessage(): string {
    const position = this.getCurrentPosition();
    const waitTime = Math.ceil(this.calculateWaitTime() / 1000);
    
    if (position === 0) {
      return "生成を開始しています...";
    } else if (position === 1) {
      return `あと ${waitTime} 秒でおじさん生成開始予定です`;
    } else {
      return `現在 ${position} 番目です。約 ${waitTime} 秒お待ちください`;
    }
  }
}

### 5.2 髪の毛マッピング

```typescript
class HairMapGenerator {
  static generateHairMap(imageUrl: string, hairDensity: number): HairMap {
    // 1. 画像解析でおじさんの顔・頭部を検出
    // 2. 髪の毛が生えている領域を特定
    // 3. 密度に基づいて髪の毛の位置を配置
    // 4. 各髪の毛に物理プロパティを設定
    
    const regions = this.detectHairRegions(imageUrl);
    const hairs = this.distributeHairs(regions, hairDensity);
    
    return {
      totalHairs: hairs.length,
      regions: regions.map(region => ({
        regionId: region.id,
        regionName: region.name,
        hairs: hairs.filter(hair => this.isInRegion(hair, region))
      }))
    };
  }
  
  private static distributeHairs(regions: Region[], density: number): Hair[] {
    // 自然な髪の毛の分布を計算
    // Poisson disc sampling等のアルゴリズムを使用
  }
}
```

## 6. パフォーマンス最適化

### 6.1 画像最適化
- **WebP形式**: 高圧縮・高品質
- **Progressive loading**: 段階的読み込み
- **CDN配信**: CloudFlareでグローバル配信
- **キャッシュ戦略**: ブラウザ・CDNキャッシュ

### 6.2 レンダリング最適化
- **Canvas最適化**: 
  - 差分レンダリング
  - オフスクリーンCanvas活用
  - RequestAnimationFrame使用
- **メモリ管理**: 
  - オブジェクトプール
  - 適切なガベージコレクション
  - メモリリーク防止

### 6.3 API最適化
- **Redis キャッシュ**: 
  - 生成済みおじさんデータ
  - ユーザーセッション
  - ランキングデータ
- **データベース最適化**:
  - 適切なインデックス
  - クエリ最適化
  - 読み取りレプリカ活用

## 7. セキュリティ対策

### 7.1 API セキュリティ
```typescript
// レート制限
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// CORS設定
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true
}));

// セキュリティヘッダー
app.use(helmet());
```

### 7.2 入力検証
```typescript
const hairPluckSchema = Joi.object({
  hairId: Joi.string().pattern(/^hair_[a-zA-Z0-9]+$/).required(),
  coordinates: Joi.object({
    x: Joi.number().min(0).max(1920).required(),
    y: Joi.number().min(0).max(1080).required()
  }).required(),
  sessionId: Joi.string().uuid().required()
});
```

### 7.3 チート対策
- **サーバーサイド検証**: 全ての髪抜きアクションをサーバーで検証
- **時間検証**: 異常に早い完了時間の検出
- **座標検証**: 髪の毛の実際の位置との照合
- **セッション管理**: 不正なセッション操作の防止

## 8. モニタリング・分析

### 8.1 パフォーマンス監視
```typescript
// Sentry設定
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// カスタムメトリクス
const metrics = {
  hairPluckLatency: new Histogram('hair_pluck_latency_seconds'),
  gameCompletionRate: new Counter('game_completion_total'),
  userEngagement: new Gauge('user_session_duration_seconds')
};
```

### 8.2 ユーザー行動分析
```typescript
// Google Analytics 4
gtag('event', 'hair_pluck', {
  hair_id: hairId,
  region: region,
  session_time: sessionTime,
  custom_parameter: value
});

// カスタム分析
const trackUserAction = (action: string, data: any) => {
  analyticsService.track({
    userId: user.id,
    event: action,
    properties: data,
    timestamp: new Date().toISOString()
  });
};
```

## 9. デプロイメント

### 9.1 CI/CD パイプライン
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v0.2.0
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 9.2 環境設定
```env
# .env.production
DATABASE_URL=mongodb+srv://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
STABILITY_API_KEY=sk-...
AWS_S3_BUCKET=ojisan-collection
SENTRY_DSN=https://...
```

---

**作成日**: 2025年8月18日  
**バージョン**: 1.0  
**作成者**: 開発チーム
