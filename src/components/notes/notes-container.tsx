import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { Note } from "@/lib/types";

import { NoteItem } from "./note-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import { getNodalApi } from "@/lib/api/nodal-api";

const SCROLL_THRESHOLD = 100;
const GROUP_WINDOW_MS = 5 * 60 * 1000;
const GROUPS_PER_PAGE = 6;

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

const resolveAttachments = async (
  result: Note[],
  folderPath: string,
): Promise<Note[]> => {
  return Promise.all(
    result.map(async (note) => {
      if (note.attachments.length === 0) return note;
      const notePath = `${folderPath}/${note.folderName}`;
      const resolvedAttachments = await getNodalApi().readAttachments(
        notePath,
        note.attachments,
      );
      return { ...note, resolvedAttachments };
    }),
  );
};

export const NotesContainer = () => {
  const {
    notesDirectory,
    activeFolder,
    notes,
    setNotes,
    scrollToNoteId,
    setScrollToNoteId,
  } = useAppStore();
  const scrollRef = useRef<HTMLElement>(null);
  const shouldScrollToBottom = useRef(false);
  const scrollRestoreHeight = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const groupOffsetRef = useRef(0);
  const folderPathRef = useRef<string | null>(null);

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

  const loadMore = useCallback(async () => {
    const folderPath = folderPathRef.current;
    if (!folderPath || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    const nextOffset = groupOffsetRef.current + GROUPS_PER_PAGE;
    const el = scrollRef.current;
    const prevScrollHeight = el?.scrollHeight ?? 0;

    const { notes: result, hasMore: more } =
      await getNodalApi().getNotesPaginated(
        folderPath,
        nextOffset,
        GROUPS_PER_PAGE,
      );

    const resolved = await resolveAttachments(result, folderPath);

    groupOffsetRef.current = nextOffset;
    scrollRestoreHeight.current = prevScrollHeight;
    setHasMore(more);
    setNotes([...resolved, ...notes]);
    setIsLoadingMore(false);
  }, [hasMore, isLoadingMore, notes, setNotes]);

  // Scroll-to-top detection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop === 0 && hasMore && !isLoadingMore) {
        loadMore();
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoadingMore, loadMore]);

  // Initial load when folder changes
  useEffect(() => {
    if (!notesDirectory || !activeFolder) {
      setNotes([]);
      setHasMore(false);
      folderPathRef.current = null;
      return;
    }

    const folderPath = `${notesDirectory}/${activeFolder}`;
    folderPathRef.current = folderPath;
    groupOffsetRef.current = 0;
    shouldScrollToBottom.current = true;
    setIsLoading(true);
    setHasMore(false);

    getNodalApi()
      .getNotesPaginated(folderPath, 0, GROUPS_PER_PAGE)
      .then(
        async ({
          notes: result,
          hasMore: more,
        }: {
          notes: Note[];
          hasMore: boolean;
        }) => {
          const resolved = await resolveAttachments(result, folderPath);
          setNotes(resolved);
          setHasMore(more);
          setIsLoading(false);
        },
      );
  }, [notesDirectory, activeFolder, setNotes]);

  useLayoutEffect(() => {
    if (isLoading) return;

    if (scrollRestoreHeight.current !== null) {
      const el = scrollRef.current;
      if (el) {
        el.scrollTop = el.scrollHeight - scrollRestoreHeight.current;
      }
      scrollRestoreHeight.current = null;
      return;
    }

    if (scrollToNoteId) {
      const el = scrollRef.current?.querySelector(
        `[data-note-id="${scrollToNoteId}"]`,
      );
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setScrollToNoteId(undefined);
      } else if (hasMore && !isLoadingMore) {
        // Pinned notes can be older than the first page. Keep loading history
        // until the target is rendered, then the next effect scrolls to it.
        void loadMore();
      } else if (!hasMore && !isLoadingMore) {
        setScrollToNoteId(undefined);
      }
    } else if (shouldScrollToBottom.current) {
      scrollToBottom();
      shouldScrollToBottom.current = false;
    } else if (isNearBottom()) {
      scrollToBottom();
    }
  }, [
    hasMore,
    isLoading,
    isLoadingMore,
    loadMore,
    notes,
    scrollToNoteId,
    setScrollToNoteId,
  ]);

  return (
    <section
      ref={scrollRef}
      className="flex-1 px-3 py-2 overflow-y-auto flex flex-col overflow-x-hidden relative"
    >
      {isLoading ? (
        <NoteSkeletons />
      ) : (
        <>
          {isLoadingMore && (
            <div className="w-full absolute top-2 flex justify-center items-center h-10 z-10">
              <Loader2 className="animate-spin" />
            </div>
          )}
          {notes.map((note, index) => (
            <NoteItem
              key={note.folderName}
              note={note}
              isGroupStart={isGroupStart(notes, index)}
            />
          ))}
        </>
      )}
    </section>
  );
};
