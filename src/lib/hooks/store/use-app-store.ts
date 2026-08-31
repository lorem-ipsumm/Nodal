import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Note, PinnedNote } from "@/lib/types";
import { getNodalApi } from "@/lib/api/nodal-api";

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
  editingNoteId: string | undefined;
  setEditingNoteId: (id: string | undefined) => void;
  shouldFocusInput: boolean;
  setShouldFocusInput: (value: boolean) => void;
  navbarVisible: boolean;
  soundsEnabled: boolean;
  toggleNavbar: () => void;
  toggleSounds: () => void;
  pinnedNotes: PinnedNote[];
  setPinnedNotes: (notes: PinnedNote[]) => void;
  loadPinnedNotes: () => Promise<void>;
  pinNote: (note: PinnedNote) => Promise<void>;
  unpinNote: (folderName: string) => Promise<void>;
  scrollToNoteId: string | undefined;
  setScrollToNoteId: (id: string | undefined) => void;
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
      editingNoteId: undefined,
      setEditingNoteId: (id: string | undefined) => set({ editingNoteId: id }),
      shouldFocusInput: false,
      setShouldFocusInput: (value: boolean) => set({ shouldFocusInput: value }),
      navbarVisible: true,
      soundsEnabled: true,
      toggleNavbar: () =>
        set((state) => ({ navbarVisible: !state.navbarVisible })),
      toggleSounds: () =>
        set((state) => ({ soundsEnabled: !state.soundsEnabled })),
      pinnedNotes: [],
      setPinnedNotes: (notes: PinnedNote[]) => set({ pinnedNotes: notes }),
      loadPinnedNotes: async () => {
        const notes = await getNodalApi().getPinnedNotes();
        set({ pinnedNotes: notes });
      },
      pinNote: async (note: PinnedNote) => {
        const updated = await getNodalApi().pinNote(note);
        set({ pinnedNotes: updated });
      },
      unpinNote: async (folderName: string) => {
        const updated = await getNodalApi().unpinNote(folderName);
        set({ pinnedNotes: updated });
      },
      scrollToNoteId: undefined,
      setScrollToNoteId: (id: string | undefined) =>
        set({ scrollToNoteId: id }),
    }),
    {
      name: "app-storage",
      partialize: (state) => ({
        activeFolder: state.activeFolder,
        navbarVisible: state.navbarVisible,
        soundsEnabled: state.soundsEnabled,
      }),
    },
  ),
);
