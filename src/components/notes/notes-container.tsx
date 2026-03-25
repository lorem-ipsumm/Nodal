import { useEffect, useRef } from "react";
import { Note } from "@/lib/types";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { NoteItem } from "./note-item";

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
        <NoteItem key={note.folderName} note={note} />
      ))}
    </section>
  );
};
