import { useState } from "react";
import { FolderTree, Pencil, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { Dialog } from "./ui/dialog";
import { ConfirmationDialog } from "./ui/confirmation-dialog";
import { RenameFolderDialog } from "./rename-folder-dialog";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { getNodalApi } from "@/lib/api/nodal-api";

interface FolderContextMenuProps {
  folder: string;
  children: React.ReactNode;
  onRenamed?: (oldName: string, newName: string) => void;
  onDeleted?: (folderName: string) => void;
  onMoveToCategory?: () => void;
}

export const FolderContextMenu = ({
  folder,
  children,
  onRenamed,
  onDeleted,
  onMoveToCategory,
}: FolderContextMenuProps) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { notesDirectory, activeFolder, setActiveFolder } = useAppStore();

  const handleConfirmDelete = () => {
    if (!notesDirectory) return;
    const folderPath = `${notesDirectory}/${folder}`;
    getNodalApi().deleteFolder(folderPath).then(() => {
      if (activeFolder === folder) setActiveFolder(undefined);
      onDeleted?.(folder);
    });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger className="w-full">{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => setRenameOpen(true)}>
            <Pencil />
            Rename folder
          </ContextMenuItem>
          {onMoveToCategory && (
            <ContextMenuItem onClick={onMoveToCategory}>
              <FolderTree />
              Move to Category
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 />
            Delete folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <RenameFolderDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        folderName={folder}
        onRenamed={onRenamed}
      />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <ConfirmationDialog
          title="Delete folder"
          description={`Are you sure you want to delete "${folder}" and all of its notes? This action cannot be undone.`}
          action={handleConfirmDelete}
        />
      </Dialog>
    </>
  );
};
