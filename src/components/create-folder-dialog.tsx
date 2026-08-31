import { useState } from "react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { ConfirmationDialog } from "./ui/confirmation-dialog";
import { getNodalApi } from "@/lib/api/nodal-api";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (folderName: string) => void;
}

export const CreateFolderDialog = ({
  open,
  onOpenChange,
  onCreated,
}: CreateFolderDialogProps) => {
  const [name, setName] = useState("");
  const { notesDirectory, setActiveFolder } = useAppStore();

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed || !notesDirectory) return;
    const folderPath = `${notesDirectory}/${trimmed}`;
    getNodalApi().createFolder(folderPath).then(() => {
      setActiveFolder(trimmed);
      onCreated?.(trimmed);
      setName("");
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
        title="New Folder"
        description={
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="Folder name..."
          />
        }
        action={handleCreate}
      />
    </Dialog>
  );
};
