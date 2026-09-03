import { useEffect, useState } from "react";
import { FolderPlus, Pencil, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { ConfirmationDialog } from "./ui/confirmation-dialog";
import { useSidebarStore } from "@/lib/hooks/store/use-sidebar-store";
import { CreateFolderDialog } from "./create-folder-dialog";

interface CategoryContextMenuProps {
  categoryId: string;
  categoryName: string;
  children: React.ReactNode;
}

export const CategoryContextMenu = ({
  categoryId,
  categoryName,
  children,
}: CategoryContextMenuProps) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [name, setName] = useState("");
  const { renameCategory, removeCategory, moveFolderToCategory } =
    useSidebarStore();

  useEffect(() => {
    if (renameOpen) setName(categoryName);
  }, [renameOpen, categoryName]);

  const handleRename = () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === categoryName) return;
    renameCategory(categoryId, trimmed);
    setRenameOpen(false);
  };

  const handleRenameOpenChange = (value: boolean) => {
    if (!value) setName("");
    setRenameOpen(value);
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil />
            Rename category
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setCreateFolderOpen(true)}>
            <FolderPlus />
            Create Folder
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 />
            Delete category
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Rename dialog */}
      <Dialog open={renameOpen} onOpenChange={handleRenameOpenChange}>
        <ConfirmationDialog
          title="Rename Category"
          description={
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
              }}
              placeholder="Category name..."
            />
          }
          action={handleRename}
        />
      </Dialog>

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onCreated={(folderName) =>
          moveFolderToCategory(folderName, categoryId)
        }
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <ConfirmationDialog
          title="Delete category"
          description={`Are you sure you want to delete "${categoryName}"? All folders inside will be moved back to uncategorized.`}
          action={() => removeCategory(categoryId)}
        />
      </Dialog>
    </>
  );
};
