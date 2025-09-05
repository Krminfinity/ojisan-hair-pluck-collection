import { create } from "zustand";

export interface Hair {
  id: string;
  x: number;
  y: number;
  angle: number;
  thickness: number;
  length: number;
  isPlucked: boolean;
}

export interface OjisanData {
  id: string;
  imageUrl: string;
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
}

export interface GameActions {
  setOjisan: (ojisan: OjisanData) => void;
  selectHair: (hairId: string) => void;
  startDrag: (x: number, y: number) => void;
  updateDrag: (x: number, y: number) => void;
  endDrag: () => void;
  pluckHair: (hairId: string) => void;
  completeGame: () => void;
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  currentOjisan: null,
  selectedHairId: null,
  isDragging: false,
  dragStart: null,
  dragCurrent: null,
  pluckedCount: 0,
  isComplete: false,

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
    }
  },
  completeGame: () => set({ isComplete: true }),
}));
