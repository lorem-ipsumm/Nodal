import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { Folder, ChevronDown, Search, FolderPlus } from "lucide-react";
import { Input } from "./ui/input";
import { Dialog, DialogContent } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { CreateFolderDialog } from "./create-folder-dialog";

export const Navbar = () => {
  const { activeFolder, notesDirectory, setActiveFolder } = useAppStore();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [folders, setFolders] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open || !notesDirectory) return;
    window.ipcRenderer
      .invoke("get-folders", notesDirectory)
      .then((result: string[]) => setFolders(result));
  }, [open, notesDirectory]);

  const filtered = folders.filter((f) =>
    f.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (folder: string) => {
    setActiveFolder(folder);
    setOpen(false);
    setSearch("");
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) setSearch("");
  };

  const handleNewFolder = () => {
    setOpen(false);
    setSearch("");
    setCreateOpen(true);
  };

  return (
    <>
      <section className="h-12 border-b flex items-center px-3 w-full justify-between">
        <button
          onClick={() => notesDirectory && setOpen(true)}
          disabled={!notesDirectory}
          className={cn(
            "flex gap-2 items-center rounded-md px-2 py-1 transition-colors",
            notesDirectory
              ? "hover:bg-accent cursor-pointer"
              : "opacity-50 cursor-default",
          )}
        >
          <Folder size={18} />
          <span className="text-sm font-medium">
            {activeFolder ?? "No folder selected"}
          </span>
          {notesDirectory && (
            <ChevronDown size={14} className="text-muted-foreground" />
          )}
        </button>
        <section>
          <Input placeholder={`Search ${activeFolder ?? ""}`} />
        </section>
      </section>

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
                  onClick={() => handleSelect(folder)}
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
