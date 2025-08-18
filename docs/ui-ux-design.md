# おじさんコレクション - UI/UX設計書

## 1. デザインシステム

### 1.1 デザインコンセプト
**テーマ**: 「親しみやすい暇つぶし体験」  
**キーワード**: リラックス、親近感、達成感、コレクション欲

### 1.2 カラーパレット

#### 1.2.1 プライマリカラー
```css
:root {
  /* メインカラー - 温かみのあるブラウン系 */
  --primary-50: #fdf8f3;
  --primary-100: #fae8d8;
  --primary-200: #f4d1b0;
  --primary-300: #ecb584;
  --primary-400: #e39456;
  --primary-500: #d97a35;  /* メインブランドカラー */
  --primary-600: #bc5f28;
  --primary-700: #9d4822;
  --primary-800: #7f3a21;
  --primary-900: #69321f;
  
  /* セカンダリカラー - 落ち着いたグレー */
  --secondary-50: #f8f9fa;
  --secondary-100: #e9ecef;
  --secondary-200: #dee2e6;
  --secondary-300: #ced4da;
  --secondary-400: #adb5bd;
  --secondary-500: #6c757d;
  --secondary-600: #495057;
  --secondary-700: #343a40;
  --secondary-800: #212529;
  --secondary-900: #161a1d;
}
```

#### 1.2.2 セマンティックカラー
```css
:root {
  /* 成功・完了 */
  --success-light: #d4edda;
  --success: #28a745;
  --success-dark: #155724;
  
  /* 警告 */
  --warning-light: #fff3cd;
  --warning: #ffc107;
  --warning-dark: #856404;
  
  /* エラー */
  --error-light: #f8d7da;
  --error: #dc3545;
  --error-dark: #721c24;
  
  /* 情報 */
  --info-light: #cce7ff;
  --info: #007bff;
  --info-dark: #003d7a;
  
  /* レアリティカラー */
  --rarity-normal: #8e8e93;
  --rarity-rare: #007aff;
  --rarity-super-rare: #af52de;
  --rarity-legendary: #ff9500;
}
```

### 1.3 タイポグラフィ

#### 1.3.1 フォントファミリー
```css
:root {
  /* 日本語フォント */
  --font-family-ja: 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN W3', 
                   'Yu Gothic Medium', '游ゴシック Medium', YuGothic, 
                   '游ゴシック体', 'Noto Sans JP', sans-serif;
  
  /* 英数字フォント */
  --font-family-en: 'Inter', 'system-ui', '-apple-system', sans-serif;
  
  /* ゲーム内数値表示 */
  --font-family-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
                      Consolas, 'Courier New', monospace;
}
```

#### 1.3.2 フォントスケール
```css
:root {
  /* ヘッダー */
  --font-size-h1: 2.5rem;   /* 40px */
  --font-size-h2: 2rem;     /* 32px */
  --font-size-h3: 1.5rem;   /* 24px */
  --font-size-h4: 1.25rem;  /* 20px */
  
  /* ボディ */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-base: 1rem;   /* 16px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-xs: 0.75rem;  /* 12px */
  
  /* 行間 */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}
```

### 1.4 スペーシング
```css
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */
  --space-20: 5rem;    /* 80px */
}
```

### 1.5 シャドウ・エレベーション
```css
:root {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  /* ゲーム要素用特殊シャドウ */
  --shadow-hair: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-pluck: 0 0 10px rgba(255, 193, 7, 0.5);
}
```

## 2. コンポーネントライブラリ

### 2.1 基本コンポーネント

#### 2.1.1 Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  children
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 
    rounded-lg font-medium transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `;
  
  const variantClasses = {
    primary: `
      bg-primary-500 text-white hover:bg-primary-600 
      focus:ring-primary-500 active:bg-primary-700
    `,
    secondary: `
      bg-secondary-200 text-secondary-800 hover:bg-secondary-300 
      focus:ring-secondary-500
    `,
    outline: `
      border-2 border-primary-500 text-primary-500 
      hover:bg-primary-500 hover:text-white focus:ring-primary-500
    `,
    ghost: `
      text-primary-500 hover:bg-primary-50 focus:ring-primary-500
    `,
    danger: `
      bg-error text-white hover:bg-error-dark focus:ring-error
    `
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <LoadingSpinner size="sm" />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </button>
  );
};
```

#### 2.1.2 Progress Component
```typescript
interface ProgressProps {
  value: number; // 0-100
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
}

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  label,
  animated = false
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const variantClasses = {
    default: 'bg-primary-500',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error'
  };
  
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-secondary-700">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-secondary-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className={`w-full bg-secondary-200 rounded-full ${sizeClasses[size]}`}>
        <div
          className={`
            ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out
            ${variantClasses[variant]}
            ${animated ? 'animate-pulse' : ''}
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
```

### 2.2 ゲーム専用コンポーネント

#### 2.2.1 HairCounter Component
```typescript
interface HairCounterProps {
  total: number;
  plucked: number;
  animated?: boolean;
}

const HairCounter: React.FC<HairCounterProps> = ({
  total,
  plucked,
  animated = true
}) => {
  const remaining = total - plucked;
  const percentage = (plucked / total) * 100;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-secondary-800">
          髪の毛カウンター
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💇‍♂️</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className={`text-2xl font-bold text-error ${animated ? 'animate-bounce' : ''}`}>
            {remaining.toLocaleString()}
          </div>
          <div className="text-sm text-secondary-600">残り</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold text-success ${animated ? 'animate-pulse' : ''}`}>
            {plucked.toLocaleString()}
          </div>
          <div className="text-sm text-secondary-600">抜いた</div>
        </div>
      </div>
      
      <Progress 
        value={percentage} 
        variant="success" 
        size="lg" 
        showLabel 
        label="進捗"
        animated={animated}
      />
    </div>
  );
};
```

#### 2.2.2 RarityBadge Component
```typescript
interface RarityBadgeProps {
  rarity: 'normal' | 'rare' | 'super_rare' | 'legendary';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const RarityBadge: React.FC<RarityBadgeProps> = ({
  rarity,
  size = 'md',
  showIcon = true
}) => {
  const rarityConfig = {
    normal: {
      label: 'ノーマル',
      color: 'bg-rarity-normal',
      icon: '👨',
      glow: ''
    },
    rare: {
      label: 'レア',
      color: 'bg-rarity-rare',
      icon: '👨‍💼',
      glow: 'shadow-lg shadow-blue-500/50'
    },
    super_rare: {
      label: 'スーパーレア',
      color: 'bg-rarity-super-rare',
      icon: '👨‍🎓',
      glow: 'shadow-lg shadow-purple-500/50 animate-pulse'
    },
    legendary: {
      label: 'レジェンダリー',
      color: 'bg-rarity-legendary',
      icon: '👑',
      glow: 'shadow-xl shadow-orange-500/50 animate-bounce'
    }
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };
  
  const config = rarityConfig[rarity];
  
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full text-white font-semibold
        ${config.color} ${sizeClasses[size]} ${config.glow}
      `}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
};
```

## 3. レイアウト設計

### 3.1 レスポンシブブレイクポイント
```css
:root {
  --breakpoint-sm: 640px;   /* スマートフォン */
  --breakpoint-md: 768px;   /* タブレット縦 */
  --breakpoint-lg: 1024px;  /* タブレット横・ノートPC */
  --breakpoint-xl: 1280px;  /* デスクトップ */
  --breakpoint-2xl: 1536px; /* 大型デスクトップ */
}
```

### 3.2 メインレイアウト構造

#### 3.2.1 デスクトップレイアウト
```
┌─────────────────────────────────────────────────┐
│                    Header                       │ 60px
├─────────────────────────────────────────────────┤
│ Side │                                         │
│ Nav  │            Main Content                 │ calc(100vh - 60px)
│ 240px│                                         │
│      │                                         │
└─────────────────────────────────────────────────┘
```

#### 3.2.2 モバイルレイアウト
```
┌─────────────────┐
│     Header      │ 56px
├─────────────────┤
│                 │
│  Main Content   │ calc(100vh - 56px - 60px)
│                 │
├─────────────────┤
│ Bottom Tab Nav  │ 60px
└─────────────────┘
```

### 3.3 ゲーム画面レイアウト

#### 3.3.1 ゲーム画面構成
```typescript
const GameLayout: React.FC = () => {
  return (
    <div className="h-screen flex flex-col bg-secondary-50">
      {/* ゲームヘッダー */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <Button variant="ghost" icon={<ArrowLeftIcon />}>
            戻る
          </Button>
          <div className="flex items-center gap-4">
            <Timer />
            <ScoreDisplay />
          </div>
          <Button variant="ghost" icon={<PauseIcon />}>
            一時停止
          </Button>
        </div>
      </header>
      
      {/* メインゲームエリア */}
      <main className="flex-1 flex">
        {/* サイドパネル（デスクトップのみ） */}
        <aside className="hidden lg:block w-80 bg-white border-r p-6">
          <HairCounter total={2847} plucked={1256} />
          <div className="mt-6">
            <RegionProgress />
          </div>
          <div className="mt-6">
            <Tips />
          </div>
        </aside>
        
        {/* ゲームキャンバス */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full aspect-square">
            <GameCanvas />
            
            {/* オーバーレイUI（モバイル用） */}
            <div className="lg:hidden absolute top-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <Progress value={44.1} showLabel label="進捗" />
              </div>
            </div>
            
            <div className="lg:hidden absolute bottom-4 left-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>残り: 1,591本</span>
                  <span>抜いた: 1,256本</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
```

## 4. インタラクション設計

### 4.1 髪の毛抜きインタラクション

#### 4.1.1 デスクトップ（マウス）
```typescript
interface MouseInteraction {
  onMouseDown: (event: MouseEvent) => void;
  onMouseMove: (event: MouseEvent) => void;
  onMouseUp: (event: MouseEvent) => void;
}

const handleMouseInteraction = {
  onMouseDown: (event) => {
    // 1. 髪の毛検出
    const hair = detectHairAtPosition(event.clientX, event.clientY);
    if (!hair) return;
    
    // 2. 掴みアニメーション開始
    startGrabAnimation(hair);
    
    // 3. カーソル変更
    document.body.style.cursor = 'grabbing';
    
    // 4. サウンド再生
    playSound('hair_grab');
  },
  
  onMouseMove: (event) => {
    if (!currentHair) return;
    
    // 1. 引っ張り力計算
    const force = calculatePullForce(startPosition, currentPosition);
    
    // 2. 髪の毛変形
    updateHairDeformation(currentHair, force);
    
    // 3. 抵抗感表現
    updateResistanceEffect(force);
  },
  
  onMouseUp: (event) => {
    if (!currentHair) return;
    
    // 1. 引っ張り力判定
    const finalForce = calculateFinalForce();
    
    if (finalForce >= currentHair.breakThreshold) {
      // 成功
      executeHairPluck(currentHair);
      playSound('hair_pluck_success');
      showSuccessEffect();
    } else {
      // 失敗
      playSound('hair_pluck_fail');
      showFailEffect();
      resetHairPosition(currentHair);
    }
    
    // 2. 状態リセット
    document.body.style.cursor = 'default';
    currentHair = null;
  }
};
```

#### 4.1.2 モバイル（タッチ）
```typescript
interface TouchInteraction {
  onTouchStart: (event: TouchEvent) => void;
  onTouchMove: (event: TouchEvent) => void;
  onTouchEnd: (event: TouchEvent) => void;
}

const handleTouchInteraction = {
  onTouchStart: (event) => {
    event.preventDefault(); // スクロール防止
    
    const touch = event.touches[0];
    const hair = detectHairAtPosition(touch.clientX, touch.clientY);
    
    if (hair) {
      // バイブレーション開始
      if (navigator.vibrate) {
        navigator.vibrate([50]); // 短いバイブ
      }
      
      startGrabAnimation(hair);
      playSound('hair_grab');
    }
  },
  
  onTouchMove: (event) => {
    event.preventDefault();
    
    if (!currentHair) return;
    
    const touch = event.touches[0];
    const force = calculatePullForce(startPosition, {
      x: touch.clientX,
      y: touch.clientY
    });
    
    // 引っ張り強度に応じたバイブレーション
    if (force > currentHair.breakThreshold * 0.8) {
      if (navigator.vibrate) {
        navigator.vibrate([10]); // 微細なバイブ
      }
    }
    
    updateHairDeformation(currentHair, force);
  },
  
  onTouchEnd: (event) => {
    event.preventDefault();
    
    if (!currentHair) return;
    
    const finalForce = calculateFinalForce();
    
    if (finalForce >= currentHair.breakThreshold) {
      // 成功時の長いバイブレーション
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      
      executeHairPluck(currentHair);
      playSound('hair_pluck_success');
      showSuccessEffect();
    } else {
      // 失敗時の短いバイブレーション
      if (navigator.vibrate) {
        navigator.vibrate([200]);
      }
      
      playSound('hair_pluck_fail');
      showFailEffect();
    }
    
    currentHair = null;
  }
};
```

### 4.2 アニメーション設計

#### 4.2.1 髪の毛プラックエフェクト
```css
@keyframes hair-pluck-success {
  0% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
  20% {
    transform: scale(1.2) rotate(5deg);
    opacity: 0.8;
  }
  50% {
    transform: scale(0.8) rotate(-10deg) translateY(-20px);
    opacity: 0.5;
  }
  100% {
    transform: scale(0) rotate(20deg) translateY(-50px);
    opacity: 0;
  }
}

@keyframes pull-resistance {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

@keyframes grab-highlight {
  0% {
    box-shadow: 0 0 0 rgba(255, 193, 7, 0);
  }
  50% {
    box-shadow: 0 0 20px rgba(255, 193, 7, 0.6);
  }
  100% {
    box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
  }
}
```

#### 4.2.2 進捗アニメーション
```css
@keyframes progress-fill {
  from {
    width: var(--from-width);
  }
  to {
    width: var(--to-width);
  }
}

@keyframes count-up {
  from {
    --number: var(--from-number);
  }
  to {
    --number: var(--to-number);
  }
}

.progress-animated {
  animation: progress-fill 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.count-animated {
  animation: count-up 0.6s ease-out forwards;
}
```

### 4.3 フィードバック設計

#### 4.3.1 視覚的フィードバック
```typescript
interface VisualFeedback {
  type: 'success' | 'fail' | 'grab' | 'pull';
  position: { x: number; y: number };
  intensity: number; // 0-1
}

const showVisualFeedback = (feedback: VisualFeedback) => {
  const element = document.createElement('div');
  element.className = `feedback-${feedback.type}`;
  element.style.left = `${feedback.position.x}px`;
  element.style.top = `${feedback.position.y}px`;
  
  switch (feedback.type) {
    case 'success':
      element.innerHTML = '✨';
      element.className += ' animate-success-burst';
      break;
    case 'fail':
      element.innerHTML = '💨';
      element.className += ' animate-fail-puff';
      break;
    case 'grab':
      element.innerHTML = '👋';
      element.className += ' animate-grab-pulse';
      break;
    case 'pull':
      element.innerHTML = '💪';
      element.className += ' animate-pull-strain';
      break;
  }
  
  document.body.appendChild(element);
  
  // アニメーション完了後に削除
  setTimeout(() => {
    element.remove();
  }, 1000);
};
```

#### 4.3.2 音響フィードバック
```typescript
interface AudioLibrary {
  'hair_grab': string;
  'hair_pull': string;
  'hair_pluck_success': string;
  'hair_pluck_fail': string;
  'progress_milestone': string;
  'game_complete': string;
  'ui_click': string;
  'ui_hover': string;
}

class AudioManager {
  private audioCache = new Map<string, HTMLAudioElement>();
  private volume = 0.7;
  private enabled = true;
  
  async preload(sounds: AudioLibrary) {
    for (const [key, url] of Object.entries(sounds)) {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = this.volume;
      this.audioCache.set(key, audio);
    }
  }
  
  play(soundKey: keyof AudioLibrary, options?: {
    volume?: number;
    pitch?: number;
    delay?: number;
  }) {
    if (!this.enabled) return;
    
    const audio = this.audioCache.get(soundKey);
    if (!audio) return;
    
    // 音声の複製を作成（同時再生対応）
    const audioClone = audio.cloneNode() as HTMLAudioElement;
    
    if (options?.volume) {
      audioClone.volume = options.volume;
    }
    
    if (options?.pitch) {
      audioClone.playbackRate = options.pitch;
    }
    
    if (options?.delay) {
      setTimeout(() => audioClone.play(), options.delay);
    } else {
      audioClone.play().catch(console.error);
    }
  }
  
  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audioCache.forEach(audio => {
      audio.volume = this.volume;
    });
  }
  
  toggle() {
    this.enabled = !this.enabled;
  }
}
```

## 5. アクセシビリティ設計

### 5.1 WAI-ARIA対応
```typescript
// ゲームキャンバスのアクセシビリティ
const GameCanvasAccessible: React.FC = () => {
  return (
    <div 
      role="application"
      aria-label="おじさんの髪の毛抜きゲーム"
      aria-describedby="game-instructions"
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`おじさんの画像。残り${remainingHairs}本の髪の毛があります`}
        onKeyDown={handleKeyboardInteraction}
      />
      
      <div id="game-instructions" className="sr-only">
        髪の毛をクリックして引っ張ることで抜くことができます。
        全ての髪の毛を抜いてゲームを完了してください。
      </div>
      
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {gameStatusMessage}
      </div>
      
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {importantGameMessage}
      </div>
    </div>
  );
};
```

### 5.2 キーボード操作対応
```typescript
const handleKeyboardInteraction = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Tab':
      // 次の髪の毛にフォーカス移動
      focusNextHair();
      break;
    case 'Enter':
    case ' ':
      // 現在フォーカス中の髪の毛を選択
      selectFocusedHair();
      break;
    case 'ArrowUp':
    case 'ArrowDown':
    case 'ArrowLeft':
    case 'ArrowRight':
      // 方向キーで髪の毛選択移動
      moveFocusByDirection(event.key);
      break;
    case 'Escape':
      // 現在の選択をキャンセル
      cancelCurrentSelection();
      break;
  }
};
```

### 5.3 コントラスト・カラー配慮
```css
/* ハイコントラストモード対応 */
@media (prefers-contrast: high) {
  :root {
    --primary-500: #b8860b;
    --secondary-500: #2c2c2c;
    --text-primary: #000000;
    --text-secondary: #333333;
    --border-color: #000000;
  }
}

/* 色覚特性配慮 */
.colorblind-safe {
  /* 色だけでなく形状・パターンでも情報を伝達 */
}

.rarity-normal::before {
  content: "●";
}

.rarity-rare::before {
  content: "◆";
}

.rarity-super-rare::before {
  content: "★";
}

.rarity-legendary::before {
  content: "👑";
}
```

---

**作成日**: 2025年8月19日  
**バージョン**: 1.0  
**対応デバイス**: デスクトップ、タブレット、スマートフォン  
**ブラウザ対応**: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
