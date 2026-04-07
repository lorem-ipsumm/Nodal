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
  removeNote: (folderName: string) => void;
  updateNote: (folderName: string, content: string) => void;
  navbarVisible: boolean;
  toggleNavbar: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      notesDirectory: undefined,
      setNotesDirectory: (notesDirectory: string | undefined) =>
        set({ notesDirectory }),
      activeFolder: undefined,
      setActiveFolder: (activeFolder: string | undefined) =>
        set({ activeFolder }),
      notes: [],
      setNotes: (notes: Note[]) => set({ notes }),
      addNote: (note: Note) =>
        set((state) => ({ notes: [...state.notes, note] })),
      removeNote: (folderName: string) =>
        set((state) => ({
          notes: state.notes.filter((n) => n.folderName !== folderName),
        })),
      updateNote: (folderName: string, content: string) =>
        set((state) => ({
          notes: state.notes.map((n) =>
            n.folderName === folderName ? { ...n, content } : n,
          ),
        })),
      navbarVisible: true,
      toggleNavbar: () =>
        set((state) => ({ navbarVisible: !state.navbarVisible })),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        activeFolder: state.activeFolder,
        navbarVisible: state.navbarVisible,
      }),
    },
  ),
);
