import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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

interface FolderContextMenuProps {
  folder: string;
  children: React.ReactNode;
  onRenamed?: (oldName: string, newName: string) => void;
  onDeleted?: (folderName: string) => void;
}

export const FolderContextMenu = ({
  folder,
  children,
  onRenamed,
  onDeleted,
}: FolderContextMenuProps) => {
  const [renameOpen, setRenameOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { notesDirectory, activeFolder, setActiveFolder } = useAppStore();

  const handleConfirmDelete = () => {
    if (!notesDirectory) return;
    const folderPath = `${notesDirectory}/${folder}`;
    window.ipcRenderer.invoke("delete-folder", folderPath).then(() => {
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
