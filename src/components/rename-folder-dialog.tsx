import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { ConfirmationDialog } from "./ui/confirmation-dialog";

interface RenameFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string | undefined;
  onRenamed?: (oldName: string, newName: string) => void;
}

export const RenameFolderDialog = ({
  open,
  onOpenChange,
  folderName,
  onRenamed,
}: RenameFolderDialogProps) => {
  const [name, setName] = useState("");
  const { notesDirectory, activeFolder, setActiveFolder } = useAppStore();

  useEffect(() => {
    if (open && folderName) setName(folderName);
  }, [open, folderName]);

  const handleRename = () => {
    const trimmed = name.trim();
    if (!trimmed || !notesDirectory || !folderName || trimmed === folderName)
      return;
    const oldPath = `${notesDirectory}/${folderName}`;
    const newPath = `${notesDirectory}/${trimmed}`;
    window.ipcRenderer.invoke("rename-folder", oldPath, newPath).then(() => {
      if (activeFolder === folderName) setActiveFolder(trimmed);
      onRenamed?.(folderName, trimmed);
      onOpenChange(false);
    });
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setName("");
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ConfirmationDialog
        title="Rename Folder"
        description={
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
            }}
            placeholder="Folder name..."
          />
        }
        action={handleRename}
      />
    </Dialog>
  );
};
