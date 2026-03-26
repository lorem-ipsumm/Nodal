import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/hooks/store/use-theme-store";
import {
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  MoonIcon,
  NotebookPenIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SunIcon,
  Trash2,
} from "lucide-react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ConfirmationDialog } from "./ui/confirmation-dialog";

export const Sidebar = () => {
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | undefined>();
  const [createOpen, setCreateOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const { notesDirectory, setNotesDirectory, activeFolder, setActiveFolder } =
    useAppStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    window.ipcRenderer
      .invoke("get-workspace")
      .then((workspace: string | undefined) => {
        if (workspace) {
          setNotesDirectory(workspace);
          window.ipcRenderer
            .invoke("get-folders", workspace)
            .then((result: string[]) => {
              setFolders(result);
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      });
  }, [setNotesDirectory]);

  const handleDeleteFolder = (folder: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFolderToDelete(folder);
    setConfirmOpen(true);
  };

  const confirmDeleteFolder = () => {
    if (!folderToDelete || !notesDirectory) return;
    const folderPath = `${notesDirectory}/${folderToDelete}`;
    window.ipcRenderer.invoke("delete-folder", folderPath).then(() => {
      setFolders((prev) => prev.filter((f) => f !== folderToDelete));
      if (activeFolder === folderToDelete) setActiveFolder(undefined);
      setFolderToDelete(undefined);
    });
  };

  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name || !notesDirectory) return;
    const folderPath = `${notesDirectory}/${name}`;
    window.ipcRenderer.invoke("create-folder", folderPath).then(() => {
      setFolders((prev) => [...prev, name]);
      setActiveFolder(name);
      setNewFolderName("");
      setCreateOpen(false);
    });
  };

  const handleSelectWorkspace = () => {
    window.ipcRenderer
      .invoke("select-workspace")
      .then((selectedPath: string | null) => {
        if (selectedPath) {
          setNotesDirectory(selectedPath);
          setActiveFolder(undefined);
          window.ipcRenderer
            .invoke("get-folders", selectedPath)
            .then((result: string[]) => {
              setFolders(result);
            });
        }
      });
  };

  return (
    <section
      className={cn(
        "h-full bg-sidebar flex flex-col border-r transition-all duration-200 overflow-hidden",
        collapsed ? "w-12" : "w-52",
      )}
    >
      <section className="h-12 flex items-center px-3 gap-2 border-b mb-5 shrink-0">
        {!collapsed && (
          <>
            <NotebookPenIcon size={20} className="shrink-0" />
            <span className="flex-1 truncate">Notes</span>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-6 w-6 shrink-0", !collapsed ? "ml-auto" : "mx-auto")}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? (
            <PanelLeftOpenIcon size={14} />
          ) : (
            <PanelLeftCloseIcon size={14} />
          )}
        </Button>
      </section>

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
          <div className="px-3">
            <div className="flex items-center justify-between mb-2">
              <Label>Folders</Label>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="New folder"
                  onClick={() => setCreateOpen(true)}
                >
                  <FolderPlusIcon size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Change workspace"
                  onClick={handleSelectWorkspace}
                >
                  <FolderOpenIcon size={13} />
                </Button>
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-1">
              {folders.map((folder) => (
                <Button
                  key={folder}
                  className="justify-start cursor-pointer group relative"
                  variant={activeFolder === folder ? "default" : "ghost"}
                  onClick={() => setActiveFolder(folder)}
                >
                  <FolderIcon size={14} className="shrink-0" />
                  <span className="truncate">{folder}</span>
                  <div
                    className="hidden group-hover:block absolute right-2 hover:text-destructive z-10"
                    onClick={(e) => handleDeleteFolder(folder, e)}
                  >
                    <Trash2 />
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </section>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setNewFolderName("");
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateFolder();
            }}
            placeholder="Folder name..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <ConfirmationDialog
          title="Delete folder"
          description={`Are you sure you want to delete "${folderToDelete}" and all of its notes? This action cannot be undone.`}
          action={confirmDeleteFolder}
        />
      </Dialog>

      <section className="px-3 py-3 border-t shrink-0">
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn("justify-start gap-2", !collapsed && "w-full")}
          onClick={toggleTheme}
        >
          {theme === "light" ? <MoonIcon size={14} /> : <SunIcon size={14} />}
          {!collapsed && (theme === "light" ? "Dark mode" : "Light mode")}
        </Button>
      </section>
    </section>
  );
};
