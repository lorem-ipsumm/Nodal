import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/hooks/store/use-theme-store";
import {
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  MoonIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  SunIcon,
} from "lucide-react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { CreateFolderDialog } from "./create-folder-dialog";
import { FolderContextMenu } from "./folder-context-menu";

export const Sidebar = () => {
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
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
      <section
        className={cn(
          "h-12 flex items-center px-3 justify-between border-b mb-3 shrink-0",
          collapsed ? "justify-center" : "",
        )}
      >
        {!collapsed && (
          <>
            <Button
              variant="ghost"
              className="flex-1 truncate justify-start px-1 font-semibold -translate-x-1 flex gap-2"
              onClick={handleSelectWorkspace}
              title="Select notes directory"
            >
              <FolderOpenIcon size={20} className="shrink-0" />
              <span className="truncate">
                {notesDirectory
                  ? notesDirectory.split(/[\\/]/).pop() || "Nodal"
                  : "Nodal"}
              </span>
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", !collapsed ? "ml-auto" : "mx-auto")}
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
            <div className="mt-1 flex flex-col gap-1">
              {folders.map((folder) => (
                <FolderContextMenu
                  key={folder}
                  folder={folder}
                  onRenamed={(oldName, newName) =>
                    setFolders((prev) =>
                      prev.map((f) => (f === oldName ? newName : f)),
                    )
                  }
                  onDeleted={(name) =>
                    setFolders((prev) => prev.filter((f) => f !== name))
                  }
                >
                  <Button
                    className="justify-start cursor-pointer w-full"
                    variant={activeFolder === folder ? "default" : "ghost"}
                    onClick={() => setActiveFolder(folder)}
                  >
                    <FolderIcon size={14} className="shrink-0" />
                    <span className="truncate">{folder}</span>
                  </Button>
                </FolderContextMenu>
              ))}
            </div>
          </div>
        )}
      </section>

      <CreateFolderDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(name) => setFolders((prev) => [...prev, name])}
      />

      <section className="flex justify-center px-2 border-t shrink-0 w-full h-12 items-center">
        <Button
          variant="ghost"
          size={"icon"}
          className={cn("gap-2", !collapsed ? "w-full justify-start pl-3" : "")}
          onClick={toggleTheme}
        >
          {theme === "light" ? <MoonIcon size={14} /> : <SunIcon size={14} />}
          {!collapsed && (theme === "light" ? "Dark mode" : "Light mode")}
        </Button>
      </section>
    </section>
  );
};
