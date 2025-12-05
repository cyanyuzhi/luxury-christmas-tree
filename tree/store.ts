import { create } from 'zustand';

interface Photo {
  id: string;
  url: string;
  position: [number, number, number]; // 在树上的挂载位置
}

interface TreeState {
  mode: 'tree' | 'exploded'; // 树的状态
  photos: Photo[];
  setMode: (mode: 'tree' | 'exploded') => void;
  addPhoto: (url: string) => void;
}

export const useTreeStore = create<TreeState>((set) => ({
  mode: 'tree',
  photos: [],
  setMode: (mode) => set({ mode }),
  addPhoto: (url) => set((state) => ({
    photos: [...state.photos, {
      id: Math.random().toString(36).substr(2, 9),
      url,
      // 随机生成螺旋位置逻辑后续在组件中细化
      position: [(Math.random() - 0.5) * 5, Math.random() * 10, (Math.random() - 0.5) * 5]
    }]
  })),
}));