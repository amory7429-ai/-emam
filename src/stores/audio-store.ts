import { create } from 'zustand';

interface AudioState {
  currentUrl: string | null;
  isPlaying: boolean;
  play: (url: string) => void;
  stop: () => void;
  setPlaying: (playing: boolean) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentUrl: null,
  isPlaying: false,
  play: (url) => set({ currentUrl: url, isPlaying: true }),
  stop: () => set({ currentUrl: null, isPlaying: false }),
  setPlaying: (playing) => set({ isPlaying: playing }),
}));
