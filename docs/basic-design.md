# おじさんコレクション - 基本設計書

## 1. システム全体アーキテクチャ

### 1.1 システム構成概要

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                         │
├─────────────────┬───────────────────┬─────────────────────┤
│   Web Browser   │   Mobile Browser  │   Progressive Web   │
│   (Desktop)     │   (iOS/Android)   │   App (PWA)        │
└─────────────────┴───────────────────┴─────────────────────┘
                              │
                              ▼ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                         CDN Layer                           │
│                     (CloudFlare)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
├─────────────────┬───────────────────┬─────────────────────┤
│   Frontend      │   API Gateway     │   WebSocket         │
│   (Next.js)     │   (Next.js API)   │   (Socket.io)      │
└─────────────────┴───────────────────┴─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
├─────────────────┬───────────────────┬─────────────────────┤
│   Game Engine   │   AI Service      │   User Service      │
│   (髪抜き制御)  │   (画像生成)      │   (認証・管理)      │
└─────────────────┴───────────────────┴─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                            │
├─────────────────┬───────────────────┬─────────────────────┤
│   MongoDB       │   Redis Cache     │   File Storage      │
│   (主データ)    │   (セッション)    │   (Cloudinary)      │
└─────────────────┴───────────────────┴─────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────┬───────────────────┬─────────────────────┤
│   Hugging Face  │   Auth0           │   Analytics         │
│   (AI生成)      │   (認証)          │   (GA4/Sentry)      │
└─────────────────┴───────────────────┴─────────────────────┘
```

### 1.2 主要コンポーネント

#### 1.2.1 フロントエンド (Next.js)
- **責務**: ユーザーインターフェース、ゲーム描画、ユーザー操作処理
- **技術**: React 18, Next.js 14, TypeScript, Canvas API/Three.js
- **特徴**: SSR対応、PWA対応、レスポンシブデザイン

#### 1.2.2 API Gateway (Next.js API Routes)
- **責務**: リクエストルーティング、認証認可、レート制限
- **技術**: Next.js API Routes, Middleware
- **特徴**: サーバーレス、自動スケーリング

#### 1.2.3 Game Engine
- **責務**: ゲームロジック、状態管理、物理計算
- **技術**: TypeScript, Custom Physics Engine
- **特徴**: リアルタイム処理、状態同期

#### 1.2.4 AI Service
- **責務**: おじさん画像生成、髪の毛マップ作成
- **技術**: Hugging Face API, OpenCV.js, Custom Algorithms
- **特徴**: 非同期処理、キューイング、品質制御

## 2. データアーキテクチャ

### 2.1 データフロー図

```
User Action → Frontend → API Gateway → Business Logic → Database
     ↑                                        ↓
     └─── WebSocket ←─── Event Manager ←─────┘

External APIs:
Hugging Face ←→ AI Service
Auth0 ←→ User Service
Cloudinary ←→ File Storage
```

### 2.2 データベース設計

#### 2.2.1 MongoDB コレクション構造

```javascript
// Users Collection
{
  _id: ObjectId,
  userId: String (unique),
  profile: {
    username: String,
    email: String,
    avatar: String,
    createdAt: Date,
    lastLoginAt: Date,
    preferences: {
      difficulty: Enum['easy', 'normal', 'hard'],
      soundEnabled: Boolean,
      vibrationEnabled: Boolean,
      language: String
    }
  },
  stats: {
    totalOjisans: Number,
    totalPlayTime: Number, // seconds
    fastestCompletion: Number, // seconds
    totalHairPlucked: Number,
    achievements: [String] // achievement IDs
  }
}

// Ojisan_Templates Collection (マスターデータ)
{
  _id: ObjectId,
  templateId: String (unique),
  version: Number,
  rarity: Enum['normal', 'rare', 'super_rare', 'legendary'],
  metadata: {
    age: Number,
    style: String,
    tags: [String],
    description: String,
    estimatedDifficulty: Number // 1-10
  },
  generation: {
    prompt: String,
    negativePrompt: String,
    parameters: {
      steps: Number,
      guidance: Number,
      seed: Number
    },
    modelUsed: String,
    generatedAt: Date
  },
  images: {
    original: String, // Cloudinary URL
    optimized: String, // 最適化版
    thumbnail: String, // サムネイル
    variants: [String] // バリエーション
  },
  hairMap: {
    totalHairs: Number,
    regions: [{
      regionId: String,
      regionName: Enum['top', 'front', 'side_left', 'side_right', 'back'],
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      },
      hairs: [{
        hairId: String,
        coordinates: {
          x: Number, // 0-1 normalized
          y: Number  // 0-1 normalized
        },
        properties: {
          thickness: Number, // 1-5
          resistance: Number, // 1-10
          color: String, // hex color
          angle: Number, // 0-360 degrees
          length: Number // 1-10
        }
      }]
    }]
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// User_Games Collection (進行状況)
{
  _id: ObjectId,
  gameId: String (unique),
  userId: String,
  ojisanTemplateId: String,
  status: Enum['active', 'paused', 'completed', 'abandoned'],
  difficulty: String,
  timeline: {
    startedAt: Date,
    lastActionAt: Date,
    completedAt: Date,
    totalPauseTime: Number // seconds
  },
  progress: {
    pluckedHairs: [String], // hairId array
    totalPlucked: Number,
    totalHairs: Number,
    progressPercentage: Number,
    currentRegion: String,
    regionProgress: [{
      regionId: String,
      completed: Boolean,
      pluckedCount: Number,
      totalCount: Number
    }]
  },
  statistics: {
    totalClicks: Number,
    successfulPlucks: Number,
    successRate: Number,
    averageResponseTime: Number,
    longestStreak: Number,
    currentStreak: Number
  },
  completion: {
    timeToComplete: Number, // seconds
    efficiency: Number, // percentage
    score: Number,
    ranking: Number, // global ranking when completed
    bonus: {
      speedBonus: Number,
      accuracyBonus: Number,
      streakBonus: Number
    }
  }
}

// Game_Sessions Collection (詳細ログ)
{
  _id: ObjectId,
  sessionId: String (unique),
  gameId: String,
  userId: String,
  sessionData: {
    startTime: Date,
    endTime: Date,
    duration: Number, // seconds
    deviceInfo: {
      userAgent: String,
      screenSize: String,
      isMobile: Boolean,
      browser: String
    }
  },
  actions: [{
    actionId: String,
    timestamp: Date,
    type: Enum['hair_click', 'hair_pluck_start', 'hair_pluck_complete', 'hair_pluck_fail', 'region_complete', 'game_pause', 'game_resume'],
    data: {
      hairId: String,
      coordinates: {
        x: Number,
        y: Number
      },
      duration: Number, // milliseconds
      success: Boolean,
      resistance: Number,
      force: Number, // simulated force applied
      effect: String // visual/audio effect triggered
    }
  }],
  performance: {
    averageFPS: Number,
    memoryUsage: Number,
    loadTime: Number,
    errors: [String]
  }
}

// Collections Collection (ユーザーコレクション)
{
  _id: ObjectId,
  userId: String,
  ojisanTemplateId: String,
  gameId: String, // completion game reference
  obtainedAt: Date,
  completionStats: {
    timeToComplete: Number,
    difficulty: String,
    score: Number,
    ranking: Number,
    isPersonalBest: Boolean
  },
  metadata: {
    nickname: String, // user-given nickname
    favorited: Boolean,
    sharedCount: Number,
    notes: String
  }
}

// Leaderboards Collection
{
  _id: ObjectId,
  type: Enum['fastest_completion', 'highest_score', 'most_collections', 'daily_challenge'],
  period: Enum['daily', 'weekly', 'monthly', 'all_time'],
  category: String, // difficulty, ojisan type, etc.
  rankings: [{
    rank: Number,
    userId: String,
    username: String,
    value: Number, // time, score, count
    achievedAt: Date,
    gameId: String
  }],
  lastUpdated: Date,
  nextUpdate: Date
}

// Challenges Collection
{
  _id: ObjectId,
  challengeId: String (unique),
  type: Enum['daily', 'weekly', 'special_event'],
  title: String,
  description: String,
  requirements: {
    ojisanType: String,
    difficulty: String,
    timeLimit: Number,
    specialConditions: [String]
  },
  rewards: {
    points: Number,
    specialOjisan: String,
    achievements: [String]
  },
  schedule: {
    startDate: Date,
    endDate: Date,
    timezone: String
  },
  participants: [{
    userId: String,
    status: Enum['active', 'completed', 'failed'],
    progress: Number,
    completedAt: Date
  }],
  isActive: Boolean
}
```

### 2.3 キャッシュ戦略 (Redis)

```javascript
// Session Cache
session:{userId} = {
  gameId: String,
  currentOjisan: String,
  lastAction: Timestamp,
  preferences: Object
}

// Game State Cache
game:{gameId} = {
  status: String,
  progress: Object,
  lastUpdate: Timestamp,
  locks: [String] // concurrent access prevention
}

// AI Generation Queue
ai_queue:pending = [
  {
    requestId: String,
    userId: String,
    prompt: String,
    priority: Number,
    timestamp: Date
  }
]

// Generated Images Cache
image:{promptHash} = {
  url: String,
  metadata: Object,
  generatedAt: Date,
  usageCount: Number
}

// Leaderboard Cache
leaderboard:{type}:{period} = {
  data: Array,
  lastUpdate: Timestamp,
  nextUpdate: Timestamp
}
```

## 3. セキュリティアーキテクチャ

### 3.1 認証・認可フロー

```
1. User Login Request → Auth0
2. Auth0 → JWT Token Return
3. Frontend → API Request (with JWT)
4. API Gateway → JWT Validation
5. Middleware → Permission Check
6. Business Logic → Data Access
7. Response → Frontend
```

### 3.2 セキュリティ層

#### 3.2.1 フロントエンド セキュリティ
- **CSP (Content Security Policy)**: XSS防止
- **HTTPS強制**: SSL/TLS暗号化
- **JWT保存**: HttpOnly Cookie + Secure Flag
- **入力検証**: クライアントサイド validation

#### 3.2.2 API セキュリティ
- **認証**: JWT Bearer Token
- **認可**: Role-based Access Control (RBAC)
- **レート制限**: IP/User別制限
- **入力検証**: Joi/Zod schemas
- **CORS**: 許可ドメイン制限

#### 3.2.3 データセキュリティ
- **暗号化**: 機密データのAES暗号化
- **アクセス制御**: MongoDB Role-based access
- **監査ログ**: 重要操作の記録
- **バックアップ**: 暗号化バックアップ

### 3.3 チート対策

#### 3.3.1 ゲーム整合性
```typescript
// Server-side validation
class GameValidation {
  validateHairPluck(action: HairPluckAction): ValidationResult {
    // 1. 髪の毛存在チェック
    if (!this.hairExists(action.hairId)) {
      return { valid: false, reason: 'HAIR_NOT_FOUND' };
    }
    
    // 2. 座標妥当性チェック
    if (!this.isValidCoordinate(action.coordinates, action.hairId)) {
      return { valid: false, reason: 'INVALID_COORDINATES' };
    }
    
    // 3. タイミングチェック
    if (!this.isValidTiming(action.timestamp)) {
      return { valid: false, reason: 'INVALID_TIMING' };
    }
    
    // 4. 速度チェック（人間的な速度範囲内か）
    if (!this.isHumanSpeed(action.sequence)) {
      return { valid: false, reason: 'SUSPICIOUS_SPEED' };
    }
    
    return { valid: true };
  }
}
```

## 4. パフォーマンスアーキテクチャ

### 4.1 フロントエンド最適化

#### 4.1.1 レンダリング最適化
```typescript
// Canvas最適化戦略
class CanvasOptimizer {
  private offscreenCanvas: OffscreenCanvas;
  private dirtyRegions: Set<Region> = new Set();
  
  // 差分レンダリング
  renderFrame() {
    if (this.dirtyRegions.size === 0) return;
    
    // 変更された領域のみ再描画
    this.dirtyRegions.forEach(region => {
      this.renderRegion(region);
    });
    
    this.dirtyRegions.clear();
  }
  
  // オブジェクトプーリング
  private hairPool = new ObjectPool<Hair>(1000);
  
  createHair(properties: HairProperties): Hair {
    const hair = this.hairPool.acquire();
    hair.initialize(properties);
    return hair;
  }
}
```

#### 4.1.2 メモリ管理
```typescript
// メモリリーク防止
class MemoryManager {
  private textures = new Map<string, WebGLTexture>();
  private audioBuffers = new Map<string, AudioBuffer>();
  
  cleanup() {
    // WebGL リソース解放
    this.textures.forEach(texture => {
      this.gl.deleteTexture(texture);
    });
    
    // Audio リソース解放
    this.audioBuffers.clear();
    
    // イベントリスナー解除
    this.removeAllEventListeners();
  }
}
```

### 4.2 バックエンド最適化

#### 4.2.1 データベース最適化
```javascript
// MongoDB インデックス設計
db.users.createIndex({ "userId": 1 }, { unique: true });
db.user_games.createIndex({ "userId": 1, "status": 1 });
db.user_games.createIndex({ "ojisanTemplateId": 1 });
db.game_sessions.createIndex({ "gameId": 1, "sessionData.startTime": -1 });
db.ojisan_templates.createIndex({ "rarity": 1, "isActive": 1 });
db.collections.createIndex({ "userId": 1, "obtainedAt": -1 });

// 複合インデックス
db.leaderboards.createIndex({ "type": 1, "period": 1, "category": 1 });
```

#### 4.2.2 キャッシュ戦略
```typescript
// 多層キャッシュ
class CacheManager {
  private l1Cache = new Map(); // メモリキャッシュ
  private l2Cache: RedisClient; // Redis
  private l3Cache: Database; // MongoDB
  
  async get(key: string): Promise<any> {
    // L1 キャッシュ確認
    let value = this.l1Cache.get(key);
    if (value) return value;
    
    // L2 キャッシュ確認
    value = await this.l2Cache.get(key);
    if (value) {
      this.l1Cache.set(key, value);
      return value;
    }
    
    // L3 データベース確認
    value = await this.l3Cache.findOne({ key });
    if (value) {
      await this.l2Cache.setex(key, 3600, value);
      this.l1Cache.set(key, value);
    }
    
    return value;
  }
}
```

## 5. 可用性・運用アーキテクチャ

### 5.1 エラーハンドリング

#### 5.1.1 フロントエンド エラーハンドリング
```typescript
// グローバルエラーハンドラー
class ErrorHandler {
  static handleError(error: Error, context: string) {
    // 1. ログ記録
    logger.error({
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // 2. Sentry送信
    Sentry.captureException(error, {
      tags: { context },
      level: 'error'
    });
    
    // 3. ユーザー通知
    this.showUserFriendlyMessage(error);
    
    // 4. 復旧処理
    this.attemptRecovery(error, context);
  }
}
```

#### 5.1.2 バックエンド エラーハンドリング
```typescript
// API エラーハンドリングミドルウェア
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorResponse = {
    error: {
      type: err.name,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal Server Error' 
        : err.message,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id']
    }
  };
  
  // ログ記録
  logger.error({
    error: err,
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    }
  });
  
  // Sentry送信
  Sentry.captureException(err);
  
  res.status(getStatusCode(err)).json(errorResponse);
};
```

### 5.2 監視・ヘルスチェック

#### 5.2.1 ヘルスチェックエンドポイント
```typescript
// /api/health
export default async function handler(req: Request, res: Response) {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      huggingface: await checkHuggingFace(),
      cloudinary: await checkCloudinary()
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: await getCPUUsage()
    }
  };
  
  const allServicesHealthy = Object.values(healthCheck.services)
    .every(status => status === 'healthy');
  
  res.status(allServicesHealthy ? 200 : 503).json(healthCheck);
}
```

### 5.3 ログ・監視

#### 5.3.1 構造化ログ
```typescript
// ログ仕様
interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  service: string;
  userId?: string;
  gameId?: string;
  action?: string;
  message: string;
  metadata?: Record<string, any>;
  traceId?: string;
}
```

#### 5.3.2 メトリクス収集
```typescript
// カスタムメトリクス
class MetricsCollector {
  private metrics = {
    gameStarted: new Counter('games_started_total'),
    gameCompleted: new Counter('games_completed_total'),
    hairPlucked: new Counter('hairs_plucked_total'),
    imageGenerated: new Counter('images_generated_total'),
    apiLatency: new Histogram('api_request_duration_seconds'),
    activeUsers: new Gauge('active_users_current')
  };
  
  trackGameEvent(event: string, metadata?: any) {
    this.metrics[event].inc();
    
    // カスタムイベント
    this.sendCustomEvent({
      event,
      metadata,
      timestamp: Date.now()
    });
  }
}
```

---

**作成日**: 2025年8月19日  
**バージョン**: 1.0  
**次回更新**: 詳細設計完了後
