import { create } from "zustand";

export interface Hair {
  id: string;
  x: number;
  y: number;
  radius: number; // 髪の毛の抜ける範囲
  isPlucked: boolean;
}

export interface OjisanData {
  id: string;
  originalImageUrl: string; // 元の画像URL
  currentImageUrl: string; // 現在の画像URL（髪抜き後）
  hairs: Hair[];
}

export interface GameState {
  currentOjisan: OjisanData | null;
  selectedHairId: string | null;
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  dragCurrent: { x: number; y: number } | null;
  pluckedCount: number;
  isComplete: boolean;
  isGenerating: boolean;
  generateProgress: number;
  generateMessage: string;
  collection: OjisanData[]; // コレクションされた完全にハゲたおじさん
}

export interface GameActions {
  setOjisan: (ojisan: OjisanData) => void;
  selectHair: (hairId: string) => void;
  startDrag: (x: number, y: number) => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: () => void;
  pluckHair: (hairId: string) => void;
  completeGame: () => void;
  setGenerating: (isGenerating: boolean, progress?: number, message?: string) => void;
  addToCollection: (ojisan: OjisanData) => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  currentOjisan: null,
  selectedHairId: null,
  isDragging: false,
  dragStart: null,
  dragCurrent: null,
  pluckedCount: 0,
  isComplete: false,
  isGenerating: false,
  generateProgress: 0,
  generateMessage: "",
  collection: [],

  setOjisan: (ojisan) => set({ currentOjisan: ojisan, pluckedCount: 0, isComplete: false }),
  selectHair: (hairId) => set({ selectedHairId: hairId }),
  startDrag: (x, y) => set({ isDragging: true, dragStart: { x, y }, dragCurrent: { x, y } }),
  updateDrag: (x, y) => set({ dragCurrent: { x, y } }),
  endDrag: () => set({ isDragging: false, dragStart: null, dragCurrent: null }),
  
  pluckHair: (hairId) => {
    const state = get();
    if (!state.currentOjisan) return;
    const hairs = state.currentOjisan.hairs.map((h) =>
      h.id === hairId ? { ...h, isPlucked: true } : h
    );
    set({
      currentOjisan: { ...state.currentOjisan, hairs },
      pluckedCount: state.pluckedCount + 1,
      selectedHairId: null,
    });
    // 全て抜けたらcomplete
    if (hairs.every((h) => h.isPlucked)) {
      set({ isComplete: true });
      // コレクションに追加
      if (state.currentOjisan) {
        const completedOjisan = { ...state.currentOjisan, hairs };
        set({ collection: [...state.collection, completedOjisan] });
      }
    }
  },
  
  completeGame: () => set({ isComplete: true }),
  
  setGenerating: (isGenerating, progress = 0, message = "") => 
    set({ isGenerating, generateProgress: progress, generateMessage: message }),
  
  addToCollection: (ojisan) => {
    const state = get();
    set({ collection: [...state.collection, ojisan] });
  },
}));
