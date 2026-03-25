import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { useThemeStore } from "@/lib/hooks/store/use-theme-store";
import { FolderIcon, MoonIcon, NotebookPenIcon, SunIcon } from "lucide-react";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

export const Sidebar = () => {
  const [folders, setFolders] = useState<string[]>([]);
  const { setNotesDirectory, activeFolder, setActiveFolder } = useAppStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const dir = "/home/lorem/Documents/my-notes";
    setNotesDirectory(dir);
    window.ipcRenderer.invoke("get-folders", dir).then((result: string[]) => {
      setFolders(result);
    });
  }, [setNotesDirectory]);

  return (
    <section className="h-full w-52 bg-sidebar flex flex-col border-r">
      <section className="h-12 flex items-center px-3 gap-3 border-b mb-5">
        <NotebookPenIcon size={20} />
        Notes
      </section>
      <section className="px-3 flex-1">
        <Label className="mb-2">Folders</Label>
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
