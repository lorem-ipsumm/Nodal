import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Note } from "@/lib/types";

interface AppStore {
  notesDirectory: string | undefined;
  setNotesDirectory: (notesDirectory: string | undefined) => void;
  activeFolder: string | undefined;
  setActiveFolder: (activeFolder: string | undefined) => void;
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      notesDirectory: "/home/lorem/Documents/my-notes",
      setNotesDirectory: (notesDirectory: string | undefined) =>
        set({ notesDirectory }),
      activeFolder: undefined,
      setActiveFolder: (activeFolder: string | undefined) =>
        set({ activeFolder }),
      notes: [],
      setNotes: (notes: Note[]) => set({ notes }),
      addNote: (note: Note) =>
        set((state) => ({ notes: [...state.notes, note] })),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        notesDirectory: state.notesDirectory,
        activeFolder: state.activeFolder,
      }),
    },
  ),
);
