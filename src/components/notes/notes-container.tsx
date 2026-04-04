import { useEffect, useRef, useState } from "react";
import { Note } from "@/lib/types";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { NoteItem } from "./note-item";
import { Skeleton } from "@/components/ui/skeleton";

const SCROLL_THRESHOLD = 100;
const GROUP_WINDOW_MS = 5 * 60 * 1000;

const isGroupStart = (notes: Note[], index: number): boolean => {
  if (index === 0) return true;
  const prev = notes[index - 1];
  const curr = notes[index];
  return curr.timestamp - prev.timestamp > GROUP_WINDOW_MS;
};

const NoteSkeletons = () => (
  <>
    {[80, 48, 32, 56, 96].map((width, i) => (
      <div key={i} className="flex items-start px-4 mt-3 pt-1 pb-1">
        <div className="w-10 flex-shrink-0 mr-3 flex items-start justify-center">
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-baseline gap-2">
            <Skeleton className="h-3.5 w-8" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-4" style={{ width: `${width}%` }} />
        </div>
      </div>
    ))}
  </>
);

export const NotesContainer = () => {
  const { notesDirectory, activeFolder, notes, setNotes } = useAppStore();
  const scrollRef = useRef<HTMLElement>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
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
        setIsLoading(false);
        requestAnimationFrame(scrollToBottom);
      });
  }, [notesDirectory, activeFolder, setNotes]);

  useEffect(() => {
    if (isNearBottom()) scrollToBottom();
  }, [notes]);

  return (
    <section
      ref={scrollRef}
      className="flex-1 px-3 py-2 overflow-y-auto flex flex-col overflow-x-hidden"
    >
      {isLoading ? (
        <NoteSkeletons />
      ) : (
        notes.map((note, index) => (
          <NoteItem
            key={note.folderName}
            note={note}
            isGroupStart={isGroupStart(notes, index)}
          />
        ))
      )}
    </section>
  );
};
