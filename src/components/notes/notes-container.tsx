import { useEffect, useRef } from "react";
import Markdown from "react-markdown";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { Note } from "@/lib/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const SCROLL_THRESHOLD = 100;

export const NotesContainer = () => {
  const { notesDirectory, activeFolder, notes, setNotes } = useAppStore();
  const scrollRef = useRef<HTMLElement>(null);

  const isNearBottom = () => {
    const el = scrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight <= SCROLL_THRESHOLD;
  };

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    if (!notesDirectory || !activeFolder) {
      setNotes([]);
      return;
    }

    const folderPath = `${notesDirectory}/${activeFolder}`;
    window.ipcRenderer
      .invoke("get-notes", folderPath)
      .then(async (result: Note[]) => {
        const resolved = await Promise.all(
          result.map(async (note) => {
            if (note.attachments.length === 0) return note;
            const notePath = `${folderPath}/${note.folderName}`;
            const resolvedAttachments = await window.ipcRenderer.invoke(
              "read-attachments",
              notePath,
              note.attachments,
            );
            return { ...note, resolvedAttachments };
          }),
        );
        setNotes(resolved);
        // Always scroll to bottom when switching folders
        requestAnimationFrame(scrollToBottom);
      });
  }, [notesDirectory, activeFolder, setNotes]);

  useEffect(() => {
    if (isNearBottom()) scrollToBottom();
  }, [notes]);

  return (
    <section
      ref={scrollRef}
      className="flex-1 px-3 py-2 overflow-y-auto flex flex-col gap-3"
    >
      {notes.map((note) => (
        <div
          key={note.folderName}
          className="group rounded-lg px-4 py-3 hover:bg-popover"
        >
          <Markdown>{note.content}</Markdown>
          {note.resolvedAttachments && note.resolvedAttachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {note.resolvedAttachments.map(({ fileName, dataUrl }) => (
                <Dialog key={fileName}>
                  <DialogTrigger className="cursor-zoom-in">
                    <img
                      src={dataUrl}
                      alt={fileName}
                      className="max-h-48 rounded-md object-cover"
                    />
                  </DialogTrigger>
                  <DialogContent
                    className="sm:max-w-[50vw] max-h-[90vh] flex items-center justify-center bg-transparent ring-0"
                    showCloseButton
                  >
                    <img
                      src={dataUrl}
                      alt={fileName}
                      className="max-w-full max-h-[calc(90vh-2rem)] object-contain rounded-md"
                    />
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          )}
          <span className="text-xs text-muted-foreground mt-2 block">
            {new Date(note.timestamp).toLocaleString()}
          </span>
        </div>
      ))}
    </section>
  );
};
