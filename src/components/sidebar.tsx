import { useEffect, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/hooks/store/use-theme-store";
import {
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  Hash,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SunIcon,
  Volume2,
  VolumeOff,
} from "lucide-react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { useSidebarStore } from "@/lib/hooks/store/use-sidebar-store";
import { CreateFolderDialog } from "./create-folder-dialog";
import { CreateCategoryDialog } from "./create-category-dialog";
import { SidebarFolderItem } from "./sidebar-folder-item";
import { SidebarCategorySection } from "./sidebar-category";
import { getNodalApi } from "@/lib/api/nodal-api";

export const Sidebar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Active drag state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeDragType, setActiveDragType] = useState<"folder" | "category" | null>(null);

  const {
    notesDirectory,
    setNotesDirectory,
    setActiveFolder,
    toggleSounds,
    soundsEnabled,
  } = useAppStore();
  const { theme, toggleTheme } = useThemeStore();

  const {
    categories,
    uncategorizedFolders,
    syncFolders,
    reorderCategories,
    reorderFoldersInCategory,
    moveFolderToCategory,
  } = useSidebarStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  useEffect(() => {
    getNodalApi()
      .getWorkspace()
      .then((workspace: string | undefined) => {
        if (workspace) {
          setNotesDirectory(workspace);
          getNodalApi()
            .getFolders(workspace)
            .then((result: string[]) => {
              syncFolders(result);
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      });
  }, [setNotesDirectory, syncFolders]);

  const handleSelectWorkspace = () => {
    getNodalApi()
      .selectWorkspace()
      .then((selectedPath: string | null) => {
        if (selectedPath) {
          setNotesDirectory(selectedPath);
          setActiveFolder(undefined);
          getNodalApi()
            .getFolders(selectedPath)
            .then((result: string[]) => {
              syncFolders(result);
            });
        }
      });
  };

  const handleFolderRenamed = (oldName: string, newName: string) => {
    // Rename in uncategorized
    reorderFoldersInCategory(
      null,
      uncategorizedFolders.map((f) => (f === oldName ? newName : f)),
    );
    // Rename inside each category
    categories.forEach((cat) => {
      if (cat.folderNames.includes(oldName)) {
        reorderFoldersInCategory(
          cat.id,
          cat.folderNames.map((f) => (f === oldName ? newName : f)),
        );
      }
    });
  };

  const handleFolderDeleted = (name: string) => {
    syncFolders(
      [...uncategorizedFolders, ...categories.flatMap((c) => c.folderNames)].filter(
        (f) => f !== name,
      ),
    );
  };

  // ─── Drag helpers ─────────────────────────────────────────────────────────

  const getCategoryIdForFolder = (folderName: string): string | null => {
    const cat = categories.find((c) => c.folderNames.includes(folderName));
    return cat ? cat.id : null;
  };

  const isCategoryId = (id: string) => categories.some((c) => c.id === id);

  const onDragStart = ({ active }: DragStartEvent) => {
    const id = String(active.id);
    setActiveId(id);
    setActiveDragType(isCategoryId(id) ? "category" : "folder");
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // Only handle cross-container moves for folders
    if (activeDragType !== "folder") return;

    const activeCatId = getCategoryIdForFolder(activeIdStr);
    let overCatId: string | null;

    if (isCategoryId(overIdStr)) {
      overCatId = overIdStr;
    } else {
      overCatId = getCategoryIdForFolder(overIdStr);
    }

    if (activeCatId === overCatId) return;

    // Move folder to the new container
    moveFolderToCategory(activeIdStr, overCatId);
  };

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    setActiveDragType(null);
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr === overIdStr) return;

    if (activeDragType === "category") {
      // Reorder categories
      const oldIndex = categories.findIndex((c) => c.id === activeIdStr);
      const newIndex = categories.findIndex((c) => c.id === overIdStr);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderCategories(
          arrayMove(categories, oldIndex, newIndex).map((c) => c.id),
        );
      }
      return;
    }

    // Folder reorder within a container
    const catId = getCategoryIdForFolder(activeIdStr);

    if (catId === null) {
      // Both in uncategorized
      const oldIdx = uncategorizedFolders.indexOf(activeIdStr);
      const newIdx = uncategorizedFolders.indexOf(overIdStr);
      if (oldIdx !== -1 && newIdx !== -1) {
        reorderFoldersInCategory(null, arrayMove(uncategorizedFolders, oldIdx, newIdx));
      }
    } else {
      const cat = categories.find((c) => c.id === catId);
      if (!cat) return;
      const oldIdx = cat.folderNames.indexOf(activeIdStr);
      const newIdx = cat.folderNames.indexOf(overIdStr);
      if (oldIdx !== -1 && newIdx !== -1) {
        reorderFoldersInCategory(catId, arrayMove(cat.folderNames, oldIdx, newIdx));
      }
    }
  };

  // Derive the label for the dragging overlay
  const activeFolderName =
    activeDragType === "folder" && activeId ? activeId : null;
  const activeCategoryName =
    activeDragType === "category" && activeId
      ? categories.find((c) => c.id === activeId)?.name ?? null
      : null;

  // All category ids and uncategorized folder names for top-level sortable
  const topLevelIds = [
    ...categories.map((c) => c.id),
    ...uncategorizedFolders,
  ];

  return (
    <section
      className={cn(
        "h-full bg-sidebar flex flex-col border-r transition-all duration-200 overflow-hidden",
        collapsed ? "w-12" : "w-52",
      )}
    >
      {/* Header */}
      <section
        className={cn(
          "h-12 flex items-center px-3 justify-between border-b mb-2 shrink-0",
          collapsed ? "justify-center" : "",
        )}
      >
        {!collapsed && (
          <Button
            variant="ghost"
            className="flex-1 truncate justify-start px-1 font-semibold -translate-x-1 flex gap-2"
            onClick={handleSelectWorkspace}
            title="Select notes directory"
            data-cuelume-press="bloom"
          >
            <FolderOpenIcon size={20} className="shrink-0" />
            <span className="truncate">
              {notesDirectory
                ? notesDirectory.split(/[\\/]/).pop() || "Nodal"
                : "Nodal"}
            </span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", !collapsed ? "ml-auto" : "mx-auto")}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          data-cuelume-press="toggle"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? (
            <PanelLeftOpenIcon size={14} />
          ) : (
            <PanelLeftCloseIcon size={14} />
          )}
        </Button>
      </section>

      {/* Content */}
      <section
        className={cn("flex-1 overflow-hidden", collapsed && "invisible")}
      >
        {!isLoading && !notesDirectory ? (
          <div className="h-full flex flex-col items-center justify-center px-4 gap-4 text-center">
            <FolderOpenIcon size={36} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No workspace selected. Choose a folder to get started.
            </p>
            <Button className="w-full" onClick={handleSelectWorkspace}>
              Select Workspace
            </Button>
          </div>
        ) : (
          <div className="h-full flex flex-col px-3">
            {/* Folders label + actions */}
            <div className="flex items-center justify-between">
              <Label>Folders</Label>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="New category"
                  onClick={() => setCreateCategoryOpen(true)}
                >
                  <Hash size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title="New folder"
                  onClick={() => setCreateOpen(true)}
                >
                  <FolderPlusIcon size={13} />
                </Button>
              </div>
            </div>

            {/* Sortable list */}
            <div className="mt-1 flex-1 overflow-y-auto flex flex-col gap-1 scrollbar-hidden">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragEnd={onDragEnd}
              >
                <SortableContext
                  items={topLevelIds}
                  strategy={verticalListSortingStrategy}
                >
                  {categories.map((category) => (
                    <SidebarCategorySection
                      key={category.id}
                      category={category}
                      onFolderRenamed={handleFolderRenamed}
                      onFolderDeleted={handleFolderDeleted}
                    />
                  ))}

                  {/* Uncategorized folders */}
                  {uncategorizedFolders.map((folder) => (
                    <SidebarFolderItem
                      key={folder}
                      folder={folder}
                      onRenamed={handleFolderRenamed}
                      onDeleted={handleFolderDeleted}
                    />
                  ))}
                </SortableContext>

                <DragOverlay>
                  {activeFolderName && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-sidebar border border-border shadow-md text-sm opacity-90">
                      <FolderIcon size={14} className="shrink-0" />
                      <span className="truncate">{activeFolderName}</span>
                    </div>
                  )}
                  {activeCategoryName && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded bg-sidebar border border-border shadow-md opacity-90">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {activeCategoryName}
                      </span>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        )}
      </section>

      <CreateCategoryDialog
        open={createCategoryOpen}
        onOpenChange={setCreateCategoryOpen}
      />

      <CreateFolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(name) => syncFolders([...uncategorizedFolders, ...categories.flatMap((c) => c.folderNames), name])}
      />

      {/* Footer */}
      <section
        className={cn(
          "flex justify-between px-2 border-t shrink-0 w-full min-h-12 items-center",
          !collapsed ? "" : "pt-2 pb-1 flex-col",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          data-cuelume-press="toggle"
        >
          {theme === "light" ? <MoonIcon size={14} /> : <SunIcon size={14} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSounds}
          data-cuelume-press="toggle"
        >
          {soundsEnabled === true ? (
            <VolumeOff size={14} />
          ) : (
            <Volume2 size={14} />
          )}
        </Button>
      </section>
    </section>
  );
};
