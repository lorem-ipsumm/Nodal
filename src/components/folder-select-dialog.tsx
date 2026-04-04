import { useState, useEffect } from "react";
import { Folder, Search, FolderPlus } from "lucide-react";
import { Dialog, DialogContent } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { CreateFolderDialog } from "./create-folder-dialog";

interface FolderSelectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notesDirectory: string | undefined;
  activeFolder: string | undefined;
  onSelect: (folder: string) => void;
}

export const FolderSelectDialog = ({
  open,
  onOpenChange,
  notesDirectory,
  activeFolder,
  onSelect,
}: FolderSelectDialogProps) => {
  const [folders, setFolders] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!open || !notesDirectory) return;
    window.ipcRenderer
      .invoke("get-folders", notesDirectory)
      .then((result: string[]) => setFolders(result));
  }, [open, notesDirectory]);

  const filtered = folders.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenChange = (value: boolean) => {
    onOpenChange(value);
    if (!value) setSearch("");
  };

  const handleSelect = (folder: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(folder);
    setSearch("");
  };

  const handleNewFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChange(false);
    setSearch("");
    setCreateOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="p-0 gap-0 overflow-hidden max-w-sm"
          showCloseButton={false}
        >
          <div className="flex items-center gap-2 px-3 py-2 border-b">
            <Search size={15} className="text-muted-foreground flex-shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search folders..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="min-h-72 max-h-72 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No folders found
              </p>
            ) : (
              filtered.map((folder) => (
                <button
                  key={folder}
                  onClick={(e) => handleSelect(folder, e)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent",
                    folder === activeFolder &&
                      "bg-accent text-accent-foreground font-medium",
                  )}
                >
                  <Folder
                    size={15}
                    className="flex-shrink-0 text-muted-foreground"
                  />
                  {folder}
                </button>
              ))
            )}
          </div>
          <div className="border-t">
            <button
              onClick={handleNewFolder}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <FolderPlus size={15} className="flex-shrink-0" />
              New Folder
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <CreateFolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(name) => setFolders((prev) => [...prev, name])}
      />
    </>
  );
};
