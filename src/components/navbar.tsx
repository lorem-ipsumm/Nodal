import { useState } from "react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { Folder, ChevronDown, Pin } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { FolderSelectDialog } from "./folder-select-dialog";
import { Button } from "./ui/button";

export const Navbar = () => {
  const { activeFolder, notesDirectory, setActiveFolder } = useAppStore();
  const [open, setOpen] = useState(false);

  const handleSelect = (folder: string) => {
    setActiveFolder(folder);
    setOpen(false);
  };

  return (
    <>
      <section className="h-12 border-b flex items-center px-3 w-full justify-between">
        <Button
          onClick={() => notesDirectory && setOpen(true)}
          disabled={!notesDirectory}
          variant={"ghost"}
          className={cn(
            "flex gap-2 items-center rounded-md px-2 py-1 transition-colors",
          )}
        >
          <Folder size={18} />
          <span className="text-sm font-medium">
            {activeFolder ?? "No folder selected"}
          </span>
          {notesDirectory && (
            <ChevronDown size={14} className="text-muted-foreground" />
          )}
        </Button>
        <section className="flex items-center gap-3">
          <Button variant={"outline"}>
            <Pin size={18} className="rotate-12" />
          </Button>
          <Input placeholder={`Search ${activeFolder ?? ""}`} />
        </section>
      </section>

      <FolderSelectDialog
        open={open}
        onOpenChange={setOpen}
        notesDirectory={notesDirectory}
        activeFolder={activeFolder}
        onSelect={handleSelect}
      />
    </>
  );
};
