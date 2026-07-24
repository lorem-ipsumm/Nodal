import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SidebarCategory {
  id: string;
  name: string;
  collapsed: boolean;
  folderNames: string[];
}

interface SidebarStore {
  categories: SidebarCategory[];
  uncategorizedFolders: string[];

  // Category actions
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  renameCategory: (id: string, name: string) => void;
  toggleCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;

  // Folder actions
  moveFolderToCategory: (folderName: string, categoryId: string | null) => void;
  reorderFoldersInCategory: (categoryId: string | null, orderedNames: string[]) => void;

  // Sync folders from filesystem (adds new ones to uncategorized, removes deleted)
  syncFolders: (allFolders: string[]) => void;
}

let nextId = Date.now();
const genId = () => String(nextId++);

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      categories: [],
      uncategorizedFolders: [],

      addCategory: (name) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: genId(), name, collapsed: false, folderNames: [] },
          ],
        })),

      removeCategory: (id) =>
        set((state) => {
          const cat = state.categories.find((c) => c.id === id);
          const freed = cat ? cat.folderNames : [];
          return {
            categories: state.categories.filter((c) => c.id !== id),
            uncategorizedFolders: [...state.uncategorizedFolders, ...freed],
          };
        }),

      renameCategory: (id, name) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, name } : c,
          ),
        })),

      toggleCategory: (id) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, collapsed: !c.collapsed } : c,
          ),
        })),

      reorderCategories: (orderedIds) =>
        set((state) => ({
          categories: orderedIds
            .map((id) => state.categories.find((c) => c.id === id))
            .filter(Boolean) as SidebarCategory[],
        })),

      moveFolderToCategory: (folderName, categoryId) =>
        set((state) => {
          // Remove folder from wherever it currently lives
          const newUncategorized = state.uncategorizedFolders.filter(
            (f) => f !== folderName,
          );
          const newCategories = state.categories.map((c) => ({
            ...c,
            folderNames: c.folderNames.filter((f) => f !== folderName),
          }));

          if (categoryId === null) {
            return {
              categories: newCategories,
              uncategorizedFolders: [...newUncategorized, folderName],
            };
          }

          return {
            categories: newCategories.map((c) =>
              c.id === categoryId
                ? { ...c, folderNames: [...c.folderNames, folderName] }
                : c,
            ),
            uncategorizedFolders: newUncategorized,
          };
        }),

      reorderFoldersInCategory: (categoryId, orderedNames) =>
        set((state) => {
          if (categoryId === null) {
            return { uncategorizedFolders: orderedNames };
          }
          return {
            categories: state.categories.map((c) =>
              c.id === categoryId ? { ...c, folderNames: orderedNames } : c,
            ),
          };
        }),

      syncFolders: (allFolders) =>
        set((state) => {
          const knownInCategories = new Set(
            state.categories.flatMap((c) => c.folderNames),
          );
          const knownUncategorized = new Set(state.uncategorizedFolders);
          const allKnown = new Set([...knownInCategories, ...knownUncategorized]);

          // New folders not yet tracked → add to uncategorized
          const newFolders = allFolders.filter((f) => !allKnown.has(f));

          // Remove deleted folders from everywhere
          const allFolderSet = new Set(allFolders);
          const newCategories = state.categories.map((c) => ({
            ...c,
            folderNames: c.folderNames.filter((f) => allFolderSet.has(f)),
          }));
          const newUncategorized = state.uncategorizedFolders.filter((f) =>
            allFolderSet.has(f),
          );

          return {
            categories: newCategories,
            uncategorizedFolders: [...newUncategorized, ...newFolders],
          };
        }),
    }),
    {
      name: "sidebar-storage",
    },
  ),
);
