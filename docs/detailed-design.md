# おじさんコレクション - 詳細設計書

## 1. フロントエンド詳細設計

### 1.1 コンポーネント設計

#### 1.1.1 アーキテクチャパターン
```
src/
├── app/                    # Next.js 13+ App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── game/              # ゲーム画面
│   ├── collection/        # コレクション画面
│   ├── leaderboard/       # ランキング画面
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ホーム画面
│   └── globals.css        # グローバルスタイル
├── components/            # 再利用可能コンポーネント
│   ├── game/             # ゲーム関連
│   │   ├── GameCanvas.tsx
│   │   ├── HairRenderer.tsx
│   │   ├── ProgressIndicator.tsx
│   │   └── EffectsManager.tsx
│   ├── collection/       # コレクション関連
│   │   ├── CollectionGrid.tsx
│   │   ├── OjisanCard.tsx
│   │   └── FilterPanel.tsx
│   ├── ui/              # 基本UIコンポーネント
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Toast.tsx
│   └── layout/          # レイアウト関連
│       ├── Header.tsx
│       ├── Navigation.tsx
│       └── Sidebar.tsx
├── hooks/               # カスタムフック
│   ├── useGame.ts
│   ├── useAudio.ts
│   ├── useVibration.ts
│   └── useCollection.ts
├── lib/                 # ユーティリティ・設定
│   ├── api.ts
│   ├── auth.ts
│   ├── constants.ts
│   └── utils.ts
├── services/            # ビジネスロジック
│   ├── gameEngine/
│   │   ├── GameEngine.ts
│   │   ├── PhysicsEngine.ts
│   │   └── StateManager.ts
│   ├── audioManager/
│   │   ├── AudioManager.ts
│   │   └── SoundLibrary.ts
│   └── apiClient/
│       ├── ApiClient.ts
│       └── endpoints.ts
├── store/               # 状態管理
│   ├── gameStore.ts
│   ├── userStore.ts
│   └── collectionStore.ts
└── types/               # TypeScript型定義
    ├── game.ts
    ├── user.ts
    └── api.ts
```

#### 1.1.2 主要コンポーネント詳細設計

##### GameCanvas.tsx
```typescript
interface GameCanvasProps {
  ojisan: OjisanData;
  gameState: GameState;
  onHairInteraction: (action: HairInteractionAction) => void;
  onGameComplete: () => void;
}

interface GameCanvasState {
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  animationFrame: number | null;
  viewport: Viewport;
  interactions: InteractionState[];
}

class GameCanvas extends React.Component<GameCanvasProps, GameCanvasState> {
  private physicsEngine: PhysicsEngine;
  private renderer: CanvasRenderer;
  private inputHandler: InputHandler;
  
  componentDidMount() {
    this.initializeCanvas();
    this.setupEventListeners();
    this.startGameLoop();
  }
  
  private initializeCanvas(): void {
    // Canvas初期化、WebGL/2Dコンテキスト設定
    const canvas = this.canvasRef.current;
    const context = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true // パフォーマンス向上
    });
    
    this.setState({ canvas, context });
    
    // 高DPI対応
    this.setupHighDPI(canvas, context);
  }
  
  private setupEventListeners(): void {
    // マウス・タッチイベント
    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    this.canvas.addEventListener('pointermove', this.handlePointerMove);
    this.canvas.addEventListener('pointerup', this.handlePointerUp);
    
    // リサイズ対応
    window.addEventListener('resize', this.handleResize);
  }
  
  private startGameLoop(): void {
    const gameLoop = (timestamp: number) => {
      this.update(timestamp);
      this.render(timestamp);
      
      this.setState({
        animationFrame: requestAnimationFrame(gameLoop)
      });
    };
    
    gameLoop(performance.now());
  }
  
  private update(timestamp: number): void {
    // 物理演算更新
    this.physicsEngine.update(timestamp);
    
    // アニメーション更新
    this.animationManager.update(timestamp);
    
    // パーティクル更新
    this.particleSystem.update(timestamp);
  }
  
  private render(timestamp: number): void {
    // 背景クリア
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // レイヤー別レンダリング
    this.renderLayer('background');
    this.renderLayer('ojisan');
    this.renderLayer('hairs');
    this.renderLayer('effects');
    this.renderLayer('ui');
  }
  
  private handlePointerDown = (event: PointerEvent): void => {
    const coords = this.getCanvasCoordinates(event);
    const hair = this.detectHairAt(coords);
    
    if (hair) {
      this.startHairInteraction(hair, coords);
    }
  };
  
  private startHairInteraction(hair: Hair, coords: Point): void {
    const interaction: HairInteraction = {
      hairId: hair.id,
      startTime: performance.now(),
      startCoords: coords,
      currentCoords: coords,
      state: 'grabbing',
      force: 0
    };
    
    this.props.onHairInteraction({
      type: 'HAIR_GRAB_START',
      hairId: hair.id,
      coordinates: coords,
      timestamp: Date.now()
    });
    
    // バイブレーション開始
    this.vibrationManager.startGrabVibration();
    
    // サウンド再生
    this.audioManager.play('hair_grab');
  }
}
```

##### HairRenderer.tsx
```typescript
interface HairProperties {
  id: string;
  position: Point;
  angle: number;
  length: number;
  thickness: number;
  color: string;
  resistance: number;
  state: 'attached' | 'grabbing' | 'pulling' | 'plucked';
}

class HairRenderer {
  private hairTextures = new Map<string, ImageData>();
  private hairGeometry = new Map<string, Path2D>();
  
  constructor(private context: CanvasRenderingContext2D) {
    this.preloadHairTextures();
  }
  
  renderHair(hair: HairProperties): void {
    this.context.save();
    
    // 髪の毛の変形計算
    const transform = this.calculateHairTransform(hair);
    this.context.setTransform(...transform);
    
    // 状態別レンダリング
    switch (hair.state) {
      case 'attached':
        this.renderAttachedHair(hair);
        break;
      case 'grabbing':
        this.renderGrabbingHair(hair);
        break;
      case 'pulling':
        this.renderPullingHair(hair);
        break;
      case 'plucked':
        this.renderPluckedHair(hair);
        break;
    }
    
    this.context.restore();
  }
  
  private renderAttachedHair(hair: HairProperties): void {
    // 基本的な髪の毛描画
    const gradient = this.createHairGradient(hair);
    this.context.fillStyle = gradient;
    
    // ベジェ曲線で自然な髪の毛を描画
    const path = this.createHairPath(hair);
    this.context.fill(path);
    
    // ハイライト効果
    this.addHairHighlight(hair);
  }
  
  private renderPullingHair(hair: HairProperties): void {
    // 引っ張られている髪の毛の描画
    const stretchFactor = this.calculateStretchFactor(hair.resistance);
    const deformation = this.calculateDeformation(hair);
    
    // 変形した髪の毛を描画
    this.context.save();
    this.context.scale(1, stretchFactor);
    this.renderAttachedHair(hair);
    this.context.restore();
    
    // ストレス表現（色の変化、震え）
    this.addStressEffects(hair);
  }
  
  private createHairPath(hair: HairProperties): Path2D {
    const path = new Path2D();
    const { position, angle, length, thickness } = hair;
    
    // 髪の毛の根元
    const rootWidth = thickness * 0.8;
    const tipWidth = thickness * 0.2;
    
    // 制御点計算
    const controlPoints = this.calculateBezierPoints(
      position, angle, length, rootWidth, tipWidth
    );
    
    // ベジェ曲線描画
    path.moveTo(controlPoints[0].x, controlPoints[0].y);
    path.bezierCurveTo(
      controlPoints[1].x, controlPoints[1].y,
      controlPoints[2].x, controlPoints[2].y,
      controlPoints[3].x, controlPoints[3].y
    );
    
    return path;
  }
}
```

##### PhysicsEngine.ts
```typescript
interface PhysicsBody {
  id: string;
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  mass: number;
  friction: number;
  elasticity: number;
  constraints: Constraint[];
}

interface Constraint {
  type: 'distance' | 'angle' | 'resistance';
  bodyA: string;
  bodyB?: string;
  restLength?: number;
  stiffness: number;
  damping: number;
}

class PhysicsEngine {
  private bodies = new Map<string, PhysicsBody>();
  private constraints: Constraint[] = [];
  private gravity = new Vector2(0, 9.81);
  private timeStep = 1/60;
  
  addHair(hair: HairProperties): void {
    // 髪の毛を物理ボディとして追加
    const body: PhysicsBody = {
      id: hair.id,
      position: new Vector2(hair.position.x, hair.position.y),
      velocity: new Vector2(0, 0),
      acceleration: new Vector2(0, 0),
      mass: hair.thickness * 0.1,
      friction: 0.8,
      elasticity: 0.2,
      constraints: []
    };
    
    this.bodies.set(hair.id, body);
    
    // 根元の固定制約
    this.addRootConstraint(hair);
  }
  
  applyForce(bodyId: string, force: Vector2): void {
    const body = this.bodies.get(bodyId);
    if (!body) return;
    
    // F = ma より a = F/m
    const acceleration = force.divide(body.mass);
    body.acceleration = body.acceleration.add(acceleration);
  }
  
  update(deltaTime: number): void {
    // 制約を複数回解決（安定性向上）
    for (let i = 0; i < 3; i++) {
      this.solveConstraints();
    }
    
    // 物理ボディ更新
    this.bodies.forEach(body => {
      this.updateBody(body, deltaTime);
    });
  }
  
  private updateBody(body: PhysicsBody, deltaTime: number): void {
    // Verlet積分
    const newPosition = body.position
      .add(body.velocity.multiply(deltaTime))
      .add(body.acceleration.multiply(0.5 * deltaTime * deltaTime));
    
    const newVelocity = body.velocity
      .add(body.acceleration.multiply(deltaTime))
      .multiply(body.friction); // 摩擦適用
    
    body.position = newPosition;
    body.velocity = newVelocity;
    body.acceleration = new Vector2(0, 0); // リセット
  }
  
  private solveConstraints(): void {
    this.constraints.forEach(constraint => {
      switch (constraint.type) {
        case 'distance':
          this.solveDistanceConstraint(constraint);
          break;
        case 'resistance':
          this.solveResistanceConstraint(constraint);
          break;
      }
    });
  }
  
  private solveResistanceConstraint(constraint: Constraint): void {
    const body = this.bodies.get(constraint.bodyA);
    if (!body) return;
    
    // 抵抗力計算
    const resistanceForce = body.velocity
      .multiply(-constraint.stiffness)
      .multiply(constraint.damping);
    
    this.applyForce(body.id, resistanceForce);
  }
  
  checkHairBreak(hairId: string): boolean {
    const body = this.bodies.get(hairId);
    if (!body) return false;
    
    // 張力計算
    const tension = this.calculateTension(body);
    const breakThreshold = this.getBreakThreshold(hairId);
    
    return tension > breakThreshold;
  }
}
```

### 1.2 状態管理設計 (Zustand)

#### 1.2.1 ゲーム状態管理
```typescript
interface GameState {
  // 現在のゲーム状態
  currentGame: GameSession | null;
  currentOjisan: OjisanData | null;
  
  // プレイヤー操作状態
  selectedHair: string | null;
  isDragging: boolean;
  dragStartPosition: Point | null;
  currentDragPosition: Point | null;
  
  // ゲーム進行状態
  totalHairs: number;
  pluckedHairs: string[];
  progress: number;
  currentRegion: string | null;
  
  // UI状態
  showProgress: boolean;
  showEffects: boolean;
  isPaused: boolean;
  
  // 統計
  startTime: number;
  lastActionTime: number;
  actionCount: number;
  successfulPlucks: number;
}

interface GameActions {
  // ゲーム制御
  startGame: (ojisan: OjisanData) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  completeGame: () => void;
  
  // 髪の毛操作
  selectHair: (hairId: string) => void;
  startDrag: (position: Point) => void;
  updateDrag: (position: Point) => void;
  endDrag: () => void;
  pluckHair: (hairId: string) => void;
  
  // 進行状況更新
  updateProgress: () => void;
  changeRegion: (regionId: string) => void;
  
  // UI制御
  togglePause: () => void;
  toggleEffects: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  // 初期状態
  currentGame: null,
  currentOjisan: null,
  selectedHair: null,
  isDragging: false,
  dragStartPosition: null,
  currentDragPosition: null,
  totalHairs: 0,
  pluckedHairs: [],
  progress: 0,
  currentRegion: null,
  showProgress: true,
  showEffects: true,
  isPaused: false,
  startTime: 0,
  lastActionTime: 0,
  actionCount: 0,
  successfulPlucks: 0,
  
  // アクション実装
  startGame: (ojisan: OjisanData) => {
    set({
      currentOjisan: ojisan,
      totalHairs: ojisan.hairMap.totalHairs,
      pluckedHairs: [],
      progress: 0,
      startTime: Date.now(),
      lastActionTime: Date.now(),
      actionCount: 0,
      successfulPlucks: 0,
      isPaused: false
    });
    
    // ゲームセッション作成API呼び出し
    gameAPI.createSession(ojisan.templateId);
  },
  
  pluckHair: (hairId: string) => {
    const state = get();
    const newPluckedHairs = [...state.pluckedHairs, hairId];
    const newProgress = (newPluckedHairs.length / state.totalHairs) * 100;
    
    set({
      pluckedHairs: newPluckedHairs,
      progress: newProgress,
      successfulPlucks: state.successfulPlucks + 1,
      lastActionTime: Date.now(),
      selectedHair: null,
      isDragging: false
    });
    
    // サーバーに同期
    gameAPI.pluckHair(hairId, {
      timestamp: Date.now(),
      progress: newProgress
    });
    
    // ゲーム完了チェック
    if (newProgress >= 100) {
      get().completeGame();
    }
  },
  
  completeGame: () => {
    const state = get();
    const completionTime = Date.now() - state.startTime;
    
    set({
      isPaused: true // ゲーム停止
    });
    
    // 完了API呼び出し
    gameAPI.completeGame({
      completionTime,
      totalActions: state.actionCount,
      successRate: state.successfulPlucks / state.actionCount
    });
  }
}));
```

#### 1.2.2 コレクション状態管理
```typescript
interface CollectionState {
  collections: OjisanCollection[];
  filteredCollections: OjisanCollection[];
  filters: CollectionFilters;
  sortBy: SortOption;
  viewMode: 'grid' | 'list';
  selectedOjisan: string | null;
  loading: boolean;
  error: string | null;
}

interface CollectionActions {
  loadCollections: () => Promise<void>;
  addToCollection: (ojisan: OjisanCollection) => void;
  removeFromCollection: (ojisanId: string) => void;
  updateFilters: (filters: Partial<CollectionFilters>) => void;
  updateSort: (sortBy: SortOption) => void;
  selectOjisan: (ojisanId: string) => void;
  shareOjisan: (ojisanId: string) => void;
}

export const useCollectionStore = create<CollectionState & CollectionActions>((set, get) => ({
  collections: [],
  filteredCollections: [],
  filters: {
    rarity: 'all',
    completionTime: 'all',
    dateRange: 'all'
  },
  sortBy: 'recent',
  viewMode: 'grid',
  selectedOjisan: null,
  loading: false,
  error: null,
  
  loadCollections: async () => {
    set({ loading: true, error: null });
    
    try {
      const collections = await collectionAPI.getUserCollections();
      set({ 
        collections,
        filteredCollections: collections,
        loading: false 
      });
      
      // フィルター適用
      get().applyFilters();
    } catch (error) {
      set({ 
        error: error.message, 
        loading: false 
      });
    }
  },
  
  updateFilters: (newFilters: Partial<CollectionFilters>) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    
    set({ filters: updatedFilters });
    get().applyFilters();
  },
  
  applyFilters: () => {
    const { collections, filters, sortBy } = get();
    
    let filtered = collections.filter(collection => {
      // レアリティフィルター
      if (filters.rarity !== 'all' && collection.rarity !== filters.rarity) {
        return false;
      }
      
      // 完了時間フィルター
      if (filters.completionTime !== 'all') {
        const timeThreshold = getTimeThreshold(filters.completionTime);
        if (collection.completionStats.timeToComplete > timeThreshold) {
          return false;
        }
      }
      
      return true;
    });
    
    // ソート適用
    filtered = sortCollections(filtered, sortBy);
    
    set({ filteredCollections: filtered });
  }
}));
```

### 1.3 API クライアント設計

#### 1.3.1 型安全なAPIクライアント
```typescript
// API型定義
interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

interface GameAPIEndpoints {
  // おじさん生成
  '/api/ojisans/generate': {
    POST: {
      request: GenerateOjisanRequest;
      response: OjisanData;
    };
  };
  
  // ゲーム操作
  '/api/game/start': {
    POST: {
      request: StartGameRequest;
      response: GameSession;
    };
  };
  
  '/api/game/pluck-hair': {
    POST: {
      request: PluckHairRequest;
      response: PluckHairResponse;
    };
  };
  
  '/api/game/complete': {
    POST: {
      request: CompleteGameRequest;
      response: CompletionResult;
    };
  };
}

// 型安全APIクライアント
class TypedAPIClient {
  private baseURL: string;
  private token: string | null = null;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }
  
  async request<
    TPath extends keyof GameAPIEndpoints,
    TMethod extends keyof GameAPIEndpoints[TPath],
    TRequest = GameAPIEndpoints[TPath][TMethod] extends { request: infer R } ? R : never,
    TResponse = GameAPIEndpoints[TPath][TMethod] extends { response: infer R } ? R : never
  >(
    path: TPath,
    method: TMethod,
    data?: TRequest
  ): Promise<TResponse> {
    const url = `${this.baseURL}${path}`;
    
    const response = await fetch(url, {
      method: method as string,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` })
      },
      body: data ? JSON.stringify(data) : undefined
    });
    
    const result: APIResponse<TResponse> = await response.json();
    
    if (!result.success) {
      throw new APIError(result.error!);
    }
    
    return result.data;
  }
  
  // 具体的なAPI呼び出しメソッド
  async generateOjisan(params: GenerateOjisanRequest): Promise<OjisanData> {
    return this.request('/api/ojisans/generate', 'POST', params);
  }
  
  async pluckHair(request: PluckHairRequest): Promise<PluckHairResponse> {
    return this.request('/api/game/pluck-hair', 'POST', request);
  }
}
```

#### 1.3.2 リアルタイム通信 (WebSocket)
```typescript
interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  messageId: string;
}

interface GameEvents {
  'generation_progress': GenerationProgressData;
  'hair_pluck_result': HairPluckResult;
  'game_complete': GameCompleteData;
  'leaderboard_update': LeaderboardUpdate;
}

class GameWebSocket {
  private ws: WebSocket | null = null;
  private eventListeners = new Map<string, Function[]>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}?token=${token}`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        resolve();
      };
      
      this.ws.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect(token);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };
    });
  }
  
  on<T extends keyof GameEvents>(
    event: T, 
    callback: (data: GameEvents[T]) => void
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }
  
  emit(event: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type: event,
        payload: data,
        timestamp: Date.now(),
        messageId: generateUUID()
      };
      
      this.ws.send(JSON.stringify(message));
    }
  }
  
  private handleMessage(message: WebSocketMessage): void {
    const listeners = this.eventListeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => callback(message.payload));
    }
  }
  
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // 指数バックオフ
      
      setTimeout(() => {
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(token);
      }, delay);
    }
  }
}
```

## 2. バックエンド詳細設計

### 2.1 API設計

#### 2.1.1 Next.js API Routes構造
```
src/app/api/
├── auth/
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── me/route.ts
├── ojisans/
│   ├── generate/route.ts
│   ├── [id]/route.ts
│   └── templates/route.ts
├── game/
│   ├── start/route.ts
│   ├── pluck-hair/route.ts
│   ├── complete/route.ts
│   └── session/[id]/route.ts
├── collection/
│   ├── route.ts
│   ├── [id]/route.ts
│   └── share/[id]/route.ts
├── leaderboard/
│   ├── route.ts
│   └── [type]/route.ts
└── health/route.ts
```

#### 2.1.2 API Route実装例

##### /api/ojisans/generate/route.ts
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateAuth } from '@/lib/auth';
import { OjisanGenerator } from '@/services/ojisanGenerator';
import { RateLimiter } from '@/lib/rateLimiter';

// リクエストスキーマ
const GenerateRequestSchema = z.object({
  age: z.enum(['young', 'middle', 'senior']),
  style: z.enum(['businessman', 'casual', 'traditional']),
  hairType: z.enum(['full', 'thinning', 'receding']),
  difficulty: z.enum(['easy', 'normal', 'hard']).optional()
});

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // レート制限チェック
    const rateLimitResult = await RateLimiter.check(user.id, 'ojisan_generation');
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'RATE_LIMIT_EXCEEDED', 
            message: 'Too many generation requests',
            details: { resetTime: rateLimitResult.resetTime }
          } 
        },
        { status: 429 }
      );
    }
    
    // リクエストバリデーション
    const body = await request.json();
    const validatedData = GenerateRequestSchema.parse(body);
    
    // おじさん生成サービス呼び出し
    const generator = new OjisanGenerator();
    const ojisan = await generator.generate({
      userId: user.id,
      ...validatedData
    });
    
    // レスポンス
    return NextResponse.json({
      success: true,
      data: ojisan,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID()
      }
    });
    
  } catch (error) {
    console.error('Ojisan generation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate ojisan'
        }
      },
      { status: 500 }
    );
  }
}
```

##### /api/game/pluck-hair/route.ts
```typescript
export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const user = await validateAuth(request);
    const body = await request.json();
    
    // スキーマバリデーション
    const validatedData = PluckHairSchema.parse(body);
    
    // ゲームセッション取得
    const gameSession = await GameSession.findById(validatedData.gameId);
    if (!gameSession || gameSession.userId !== user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'GAME_NOT_FOUND' } },
        { status: 404 }
      );
    }
    
    // チート検証
    const validationResult = await GameValidator.validateHairPluck(
      gameSession,
      validatedData
    );
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_ACTION', message: validationResult.reason } },
        { status: 400 }
      );
    }
    
    // 髪の毛抜き処理
    const gameEngine = new GameEngine(gameSession);
    const result = await gameEngine.pluckHair(validatedData.hairId, {
      coordinates: validatedData.coordinates,
      force: validatedData.force,
      timestamp: validatedData.timestamp
    });
    
    // データベース更新
    await gameSession.updateProgress(result);
    
    // レスポンス時間計算
    const responseTime = performance.now() - startTime;
    
    // メトリクス記録
    MetricsCollector.recordAPILatency('pluck_hair', responseTime);
    MetricsCollector.incrementCounter('hair_plucked');
    
    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        responseTime: Math.round(responseTime)
      }
    });
    
  } catch (error) {
    ErrorHandler.handleAPIError(error, 'pluck_hair', request);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

### 2.2 ビジネスロジック層

#### 2.2.1 OjisanGenerator Service
```typescript
interface GenerationRequest {
  userId: string;
  age: 'young' | 'middle' | 'senior';
  style: 'businessman' | 'casual' | 'traditional';
  hairType: 'full' | 'thinning' | 'receding';
  difficulty?: 'easy' | 'normal' | 'hard';
}

class OjisanGenerator {
  private huggingFaceClient: HuggingFaceClient;
  private imageProcessor: ImageProcessor;
  private hairMapGenerator: HairMapGenerator;
  private cacheManager: CacheManager;
  
  constructor() {
    this.huggingFaceClient = new HuggingFaceClient();
    this.imageProcessor = new ImageProcessor();
    this.hairMapGenerator = new HairMapGenerator();
    this.cacheManager = new CacheManager();
  }
  
  async generate(request: GenerationRequest): Promise<OjisanData> {
    // 1. プロンプト生成
    const prompt = this.createPrompt(request);
    const promptHash = this.hashPrompt(prompt);
    
    // 2. キャッシュチェック
    const cached = await this.cacheManager.get(`ojisan:${promptHash}`);
    if (cached) {
      return this.enhanceCachedOjisan(cached, request);
    }
    
    // 3. 生成キューに追加
    const queuePosition = await GenerationQueue.add({
      userId: request.userId,
      prompt,
      priority: this.calculatePriority(request.userId)
    });
    
    // 4. キュー状況通知
    await this.notifyQueueStatus(request.userId, queuePosition);
    
    // 5. AI画像生成実行
    const generatedImage = await this.generateWithRetry(prompt);
    
    // 6. 画像後処理
    const processedImage = await this.imageProcessor.enhance(generatedImage);
    
    // 7. 髪の毛マップ生成
    const hairMap = await this.hairMapGenerator.generate(processedImage, request);
    
    // 8. ストレージ保存
    const imageUrls = await this.saveImages(processedImage);
    
    // 9. データベース保存
    const ojisanData = await this.saveOjisanTemplate({
      ...request,
      prompt,
      images: imageUrls,
      hairMap,
      rarity: this.calculateRarity(request, hairMap)
    });
    
    // 10. キャッシュ保存
    await this.cacheManager.set(`ojisan:${promptHash}`, ojisanData, 86400);
    
    return ojisanData;
  }
  
  private createPrompt(request: GenerationRequest): PromptData {
    const basePrompt = this.getBasePrompt(request);
    const qualityModifiers = this.getQualityModifiers();
    const styleModifiers = this.getStyleModifiers(request);
    
    return {
      prompt: [basePrompt, ...styleModifiers, ...qualityModifiers].join(', '),
      negative_prompt: this.getNegativePrompt(),
      parameters: {
        num_inference_steps: 30,
        guidance_scale: 7.5,
        width: 768,
        height: 768,
        seed: Math.floor(Math.random() * 1000000)
      }
    };
  }
  
  private async generateWithRetry(prompt: PromptData): Promise<Buffer> {
    const maxRetries = 3;
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Generation attempt ${attempt}/${maxRetries}`);
        
        const result = await this.huggingFaceClient.generateImage(prompt);
        
        // 品質チェック
        const quality = await this.imageProcessor.assessQuality(result);
        if (quality.score >= 0.7) {
          return result;
        }
        
        throw new Error(`Low quality image (score: ${quality.score})`);
        
      } catch (error) {
        lastError = error;
        console.error(`Generation attempt ${attempt} failed:`, error);
        
        if (attempt < maxRetries) {
          // 指数バックオフ
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }
    
    throw new Error(`Failed to generate after ${maxRetries} attempts: ${lastError.message}`);
  }
  
  private calculateRarity(request: GenerationRequest, hairMap: HairMap): RarityType {
    let rarityScore = 0;
    
    // 髪の毛密度による判定
    const hairDensity = hairMap.totalHairs / (768 * 768);
    if (hairDensity > 0.8) rarityScore += 30;
    else if (hairDensity > 0.6) rarityScore += 20;
    else if (hairDensity > 0.4) rarityScore += 10;
    
    // スタイルによる判定
    if (request.style === 'traditional') rarityScore += 20;
    if (request.age === 'senior') rarityScore += 15;
    
    // ランダム要素
    rarityScore += Math.random() * 40;
    
    if (rarityScore >= 80) return 'legendary';
    if (rarityScore >= 60) return 'super_rare';
    if (rarityScore >= 40) return 'rare';
    return 'normal';
  }
}
```

#### 2.2.2 GameEngine Service
```typescript
class GameEngine {
  private gameSession: GameSession;
  private physicsEngine: ServerPhysicsEngine;
  private validationEngine: ValidationEngine;
  
  constructor(gameSession: GameSession) {
    this.gameSession = gameSession;
    this.physicsEngine = new ServerPhysicsEngine(gameSession.ojisanData);
    this.validationEngine = new ValidationEngine(gameSession);
  }
  
  async pluckHair(hairId: string, action: HairPluckAction): Promise<HairPluckResult> {
    // 1. 基本バリデーション
    const validation = await this.validationEngine.validateAction(hairId, action);
    if (!validation.valid) {
      throw new GameValidationError(validation.reason);
    }
    
    // 2. 物理計算
    const hair = this.gameSession.getHair(hairId);
    const resistance = this.physicsEngine.calculateResistance(hair, action.force);
    const breakThreshold = this.calculateBreakThreshold(hair);
    
    // 3. 成功判定
    const success = resistance >= breakThreshold;
    
    if (success) {
      // 髪の毛削除
      await this.gameSession.removeHair(hairId);
      
      // 進捗更新
      const newProgress = this.gameSession.calculateProgress();
      
      // 統計更新
      await this.updateStatistics(action, true);
      
      // エフェクト計算
      const effects = this.calculateEffects(hair, action);
      
      return {
        success: true,
        hairId,
        newProgress,
        effects,
        resistance,
        timestamp: Date.now()
      };
    } else {
      // 失敗時の処理
      await this.updateStatistics(action, false);
      
      return {
        success: false,
        hairId,
        reason: 'insufficient_force',
        requiredForce: breakThreshold,
        actualForce: action.force,
        timestamp: Date.now()
      };
    }
  }
  
  private calculateBreakThreshold(hair: Hair): number {
    // 髪の毛の物理プロパティに基づく計算
    const baseThreshold = hair.thickness * 10;
    const resistanceMultiplier = hair.resistance / 5;
    const difficultyMultiplier = this.getDifficultyMultiplier();
    
    return baseThreshold * resistanceMultiplier * difficultyMultiplier;
  }
  
  private calculateEffects(hair: Hair, action: HairPluckAction): EffectData {
    return {
      visual: {
        type: 'pluck_success',
        position: action.coordinates,
        intensity: Math.min(action.force / 100, 1.0),
        color: hair.color,
        particles: this.generateParticleData(hair)
      },
      audio: {
        sound: 'hair_pluck_success',
        volume: Math.min(action.force / 150, 0.8),
        pitch: 1.0 + (hair.thickness - 3) * 0.1
      },
      haptic: {
        type: 'pluck_vibration',
        intensity: Math.min(action.force / 200, 1.0),
        duration: 150 + hair.resistance * 10
      }
    };
  }
  
  async checkGameCompletion(): Promise<boolean> {
    const remainingHairs = this.gameSession.getRemainingHairs();
    
    if (remainingHairs.length === 0) {
      await this.completeGame();
      return true;
    }
    
    return false;
  }
  
  private async completeGame(): Promise<void> {
    const completionTime = Date.now() - this.gameSession.startTime;
    const stats = this.gameSession.getStatistics();
    
    // スコア計算
    const score = this.calculateFinalScore(completionTime, stats);
    
    // ランキング更新
    const ranking = await LeaderboardService.updateRanking(
      this.gameSession.userId,
      'fastest_completion',
      completionTime
    );
    
    // コレクションに追加
    await CollectionService.addToCollection(
      this.gameSession.userId,
      this.gameSession.ojisanTemplateId,
      {
        completionTime,
        score,
        ranking,
        difficulty: this.gameSession.difficulty
      }
    );
    
    // 実績チェック
    await AchievementService.checkAchievements(this.gameSession.userId, {
      completionTime,
      score,
      stats
    });
    
    // ゲームセッション完了
    await this.gameSession.markCompleted({
      completionTime,
      score,
      ranking
    });
  }
}
```

### 2.3 データアクセス層

#### 2.3.1 MongoDB Repository Pattern
```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  findMany(filter: Partial<T>, options?: QueryOptions): Promise<T[]>;
  create(data: Omit<T, '_id'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

class MongoRepository<T extends { _id: string }> implements Repository<T> {
  private collection: Collection<T>;
  
  constructor(db: Db, collectionName: string) {
    this.collection = db.collection<T>(collectionName);
  }
  
  async findById(id: string): Promise<T | null> {
    try {
      return await this.collection.findOne({ _id: new ObjectId(id) } as any);
    } catch (error) {
      throw new DatabaseError(`Failed to find document by id: ${error.message}`);
    }
  }
  
  async findMany(filter: Partial<T>, options: QueryOptions = {}): Promise<T[]> {
    try {
      let query = this.collection.find(filter as any);
      
      if (options.sort) {
        query = query.sort(options.sort);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.skip) {
        query = query.skip(options.skip);
      }
      
      return await query.toArray();
    } catch (error) {
      throw new DatabaseError(`Failed to find documents: ${error.message}`);
    }
  }
  
  async create(data: Omit<T, '_id'>): Promise<T> {
    try {
      const document = {
        ...data,
        _id: new ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as T;
      
      const result = await this.collection.insertOne(document);
      return { ...document, _id: result.insertedId.toString() } as T;
    } catch (error) {
      throw new DatabaseError(`Failed to create document: ${error.message}`);
    }
  }
  
  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(id) } as any,
        { $set: updateData },
        { returnDocument: 'after' }
      );
      
      return result.value;
    } catch (error) {
      throw new DatabaseError(`Failed to update document: ${error.message}`);
    }
  }
}

// 具体的なリポジトリ実装
class OjisanTemplateRepository extends MongoRepository<OjisanTemplate> {
  constructor(db: Db) {
    super(db, 'ojisan_templates');
  }
  
  async findByRarity(rarity: RarityType): Promise<OjisanTemplate[]> {
    return this.findMany({ rarity, isActive: true });
  }
  
  async findPopular(limit: number = 10): Promise<OjisanTemplate[]> {
    return this.collection.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'user_games',
          localField: 'templateId',
          foreignField: 'ojisanTemplateId',
          as: 'games'
        }
      },
      {
        $addFields: {
          popularity: { $size: '$games' }
        }
      },
      { $sort: { popularity: -1 } },
      { $limit: limit }
    ]).toArray();
  }
}
```

---

**作成日**: 2025年8月19日  
**バージョン**: 1.0  
**次回更新**: 実装開始後の調整時
