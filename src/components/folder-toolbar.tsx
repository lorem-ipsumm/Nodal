import { useState } from "react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import type { PinnedNote } from "@/lib/types";
import { Folder, ChevronDown, Pin, StickyNote, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmationDialog } from "./ui/confirmation-dialog";
import { Dialog } from "./ui/dialog";
import { FolderSelectDialog } from "./folder-select-dialog";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export const FolderToolbar = () => {
  const {
    activeFolder,
    notesDirectory,
    setActiveFolder,
    pinnedNotes,
    unpinNote,
    setScrollToNoteId,
    setHighlightedNoteId,
  } = useAppStore();
  const [open, setOpen] = useState(false);
  const [pinToRemove, setPinToRemove] = useState<PinnedNote | null>(null);

  const handleSelect = (folder: string) => {
    setActiveFolder(folder);
    setOpen(false);
  };

  const handlePinnedNoteClick = (folderName: string, folder: string) => {
    setScrollToNoteId(folderName);
    setHighlightedNoteId(folderName);
    window.setTimeout(() => setHighlightedNoteId(undefined), 5000);
    if (folder !== activeFolder) {
      setActiveFolder(folder);
    }
  };

  return (
    <>
      <section className="h-12 border-b flex items-center pl-3 pr-2 w-full justify-between">
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
          <DropdownMenu>
            <DropdownMenuTrigger
            // className={cn(
            //   "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 transition-colors cursor-pointer aspect-square",
            // )}
            >
              <Button variant={"outline"}>
                <Pin
                  size={10}
                  className={cn(
                    "rotate-12",
                    pinnedNotes.length > 0 && "fill-current",
                  )}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="flex items-center gap-2">
                  <Pin size={14} className="rotate-12" />
                  Pinned Notes
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {pinnedNotes.length === 0 ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No pinned notes yet
                </div>
              ) : (
                pinnedNotes.map((pin) => (
                  <DropdownMenuItem
                    key={`${pin.folder}/${pin.folderName}`}
                    onClick={() =>
                      handlePinnedNoteClick(pin.folderName, pin.folder)
                    }
                    className="group flex flex-col items-start gap-0.5 cursor-pointer pr-10"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <StickyNote
                        size={14}
                        className="shrink-0 text-muted-foreground"
                      />
                      <span className="text-xs text-muted-foreground truncate">
                        {pin.folder}
                      </span>
                    </div>
                    <span className="text-sm truncate w-full pl-5">
                      {pin.contentPreview || "Empty note"}
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${pin.contentPreview || "pinned note"} from pinned notes`}
                      title="Remove pinned note"
                      className="absolute right-2 top-1/2 hidden size-6 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-destructive/10! hover:text-destructive! group-hover:flex cursor-pointer"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setPinToRemove(pin);
                      }}
                    >
                      <X className="size-4" />
                    </button>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          {/*<Input placeholder={`Search ${activeFolder ?? ""}`} />*/}
        </section>
      </section>

      <FolderSelectDialog
        open={open}
        onOpenChange={setOpen}
        notesDirectory={notesDirectory}
        activeFolder={activeFolder}
        onSelect={handleSelect}
      />

      <Dialog
        open={pinToRemove !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPinToRemove(null);
        }}
      >
        {pinToRemove && (
          <ConfirmationDialog
            title="Remove pinned note?"
            description="This will remove the note from your pinned notes. The note itself will not be deleted."
            action={() => {
              void unpinNote(pinToRemove.folderName);
              setPinToRemove(null);
            }}
          />
        )}
      </Dialog>
    </>
  );
};
