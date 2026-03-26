import { useState } from "react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

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
    window.ipcRenderer.invoke("create-folder", folderPath).then(() => {
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
          placeholder="Folder name..."
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
