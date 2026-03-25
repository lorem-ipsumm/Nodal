import { useEffect, useState } from "react";
import { useThemeStore } from "@/lib/hooks/store/use-theme-store";
import {
  FolderIcon,
  FolderOpenIcon,
  MoonIcon,
  NotebookPenIcon,
  SunIcon,
} from "lucide-react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { useAppStore } from "@/lib/hooks/store/use-app-store";

export const Sidebar = () => {
  const [folders, setFolders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    <section className="h-full w-52 bg-sidebar flex flex-col border-r">
      <section className="h-12 flex items-center px-3 gap-3 border-b mb-5">
        <NotebookPenIcon size={20} />
        Notes
      </section>

      {!isLoading && !notesDirectory ? (
        <section className="flex-1 flex flex-col items-center justify-center px-4 gap-4 text-center">
          <FolderOpenIcon size={36} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No workspace selected. Choose a folder to get started.
          </p>
          <Button className="w-full" onClick={handleSelectWorkspace}>
            Select Workspace
          </Button>
        </section>
      ) : (
        <section className="px-3 flex-1">
          <div className="flex items-center justify-between mb-2">
            <Label>Folders</Label>
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
          <section className="mt-1 flex flex-col gap-1">
            {folders.map((folder) => (
              <Button
                key={folder}
                className="justify-start cursor-pointer"
                variant={activeFolder === folder ? "default" : "ghost"}
                onClick={() => setActiveFolder(folder)}
              >
                <FolderIcon size={14} className="shrink-0" />
                <span className="truncate">{folder}</span>
              </Button>
            ))}
          </section>
        </section>
      )}

      <section className="px-3 py-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={toggleTheme}
        >
          {theme === "light" ? <MoonIcon size={14} /> : <SunIcon size={14} />}
          {theme === "light" ? "Dark mode" : "Light mode"}
        </Button>
      </section>
    </section>
  );
};
