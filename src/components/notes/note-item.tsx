import { useCallback, useEffect, useMemo, useState } from "react";
import { FolderSelectDialog } from "../folder-select-dialog";
import { Note, NoteAction } from "@/lib/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { cn } from "@/lib/utils";
import {
  Copy,
  Edit,
  Edit2,
  File,
  FileAudio,
  FileCode,
  FileText,
  FileVideo,
  FolderInput,
  Pin,
  StickyNote,
  Trash2,
} from "lucide-react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import { MarkdownEditor } from "./markdown-editor";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { NoteActions } from "./note-actions";

interface NoteItemProps {
  note: Note;
  isGroupStart: boolean;
}

const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

const formatDateTime = (timestamp: number) =>
  new Date(timestamp).toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  });

export const NoteItem = ({ note, isGroupStart }: NoteItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [contextMenuImage, setContextMenuImage] = useState<string | null>(null);
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const {
    notesDirectory,
    activeFolder,
    updateNote,
    removeNote,
    editingNoteId,
    setEditingNoteId,
    setShouldFocusInput,
    pinnedNotes,
    pinNote,
    unpinNote,
  } = useAppStore();

  const isPinned = pinnedNotes.some((p) => p.folderName === note.folderName);

  const handleSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || !notesDirectory || !activeFolder) return;
    const notePath = `${notesDirectory}/${activeFolder}/${note.folderName}`;
    await window.ipcRenderer.invoke("update-note", notePath, trimmed);
    updateNote(note.folderName, trimmed);
    setIsEditing(false);
    setShouldFocusInput(true);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
    setShouldFocusInput(true);
  };

  useEffect(() => {
    if (!isEditing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditContent(note.content);
        setIsEditing(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, note.content]);

  const handleEdit = useCallback(() => {
    setEditContent(note.content);
    setIsEditing(true);
  }, [note.content]);

  useEffect(() => {
    if (editingNoteId === note.folderName) {
      setEditContent(note.content);
      setIsEditing(true);
      setEditingNoteId(undefined);
    }
  }, [editingNoteId, note.folderName, note.content, setEditingNoteId]);

  const deleteNote = useCallback(() => {
    if (!notesDirectory || !activeFolder) return;
    const notePath = `${notesDirectory}/${activeFolder}/${note.folderName}`;
    window.ipcRenderer.invoke("delete-note", notePath).then(() => {
      removeNote(note.folderName);
    });
  }, [notesDirectory, activeFolder, note.folderName, removeNote]);

  const handleDelete = useCallback(
    (e?: React.MouseEvent) => {
      if (e?.shiftKey) {
        deleteNote();
      } else {
        setConfirmOpen(true);
      }
    },
    [deleteNote],
  );

  const handleMoveNote = async (targetFolder: string) => {
    if (!notesDirectory || !activeFolder) return;
    const sourcePath = `${notesDirectory}/${activeFolder}/${note.folderName}`;
    const destinationFolderPath = `${notesDirectory}/${targetFolder}`;
    await window.ipcRenderer.invoke(
      "move-note",
      sourcePath,
      destinationFolderPath,
    );
    removeNote(note.folderName);
    setMoveDialogOpen(false);
  };

  const handleCopyImage = async () => {
    if (!contextMenuImage) return;
    const res = await fetch(contextMenuImage);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    setContextMenuImage(null);
  };

  const actions = useMemo<NoteAction[]>(
    () => [
      { label: "Edit", icon: <Edit2 />, onClick: handleEdit },
      {
        label: isPinned ? "Unpin Note" : "Pin Note",
        icon: <Pin className={isPinned ? "fill-current" : ""} />,
        onClick: () => {
          if (isPinned) {
            unpinNote(note.folderName);
          } else if (activeFolder) {
            pinNote({
              folderName: note.folderName,
              folder: activeFolder,
              contentPreview: note.content.slice(0, 80).replace(/\n/g, " "),
            });
          }
        },
      },
      {
        label: "Move to Folder",
        icon: <FolderInput />,
        onClick: () => setMoveDialogOpen(true),
        contextMenuOnly: true,
      },
      { separator: true },
      {
        label: "Delete",
        icon: <Trash2 />,
        onClick: handleDelete,
        variant: "destructive",
      },
    ],
    [
      handleEdit,
      handleDelete,
      isPinned,
      activeFolder,
      note.folderName,
      note.content,
      pinNote,
      unpinNote,
    ],
  );

  return (
    <>
      <ContextMenu
        onOpenChange={(open) => {
          if (!open) setContextMenuImage(null);
        }}
      >
        <ContextMenuTrigger
          data-note-id={note.folderName}
          className={cn(
            "group flex items-start rounded-lg px-4 hover:bg-popover relative w-full select-text",
            isGroupStart ? "mt-3 pt-1 pb-1" : "py-0.5",
          )}
        >
          {/* Left column: avatar or hover timestamp */}
          <div className="w-10 flex-shrink-0 mr-3 flex items-start justify-center">
            {isGroupStart ? (
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center mt-0.5 -translate-x-1">
                <StickyNote className="w-4 h-4 text-primary-foreground" />
              </div>
            ) : (
              <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 leading-tight whitespace-nowrap select-none">
                {formatTime(note.timestamp)}
              </span>
            )}
          </div>

          {/* Right column: header + content */}
          <div className="flex-1 min-w-0">
            {isGroupStart && (
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="font-semibold text-sm leading-tight">
                  Note
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDateTime(note.timestamp)}
                </span>
              </div>
            )}

            {!isEditing && (
              <NoteActions
                className="hidden group-hover:flex"
                actions={actions}
              />
            )}

            {isEditing ? (
              <div className="bg-popover rounded-lg border flex flex-col mt-1">
                <section className="flex">
                  <MarkdownEditor
                    value={editContent}
                    onChange={setEditContent}
                    onSubmit={handleSave}
                    onCancel={handleCancel}
                    placeholder="Edit note..."
                    className="flex-1 min-w-0 px-3 min-h-10"
                    autoFocus
                  />
                </section>
                <section className="text-xs text-muted-foreground pl-3 pb-2 flex gap-1.5 items-center">
                  <Edit size={10} />
                  escape to cancel • enter to save
                </section>
              </div>
            ) : (
              <>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-li:text-foreground prose-code:text-foreground prose-blockquote:text-muted-foreground prose-lead:text-foreground">
                  <Markdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          onClick={(e) => {
                            e.preventDefault();
                            if (href)
                              window.ipcRenderer.invoke("open-external", href);
                          }}
                          data-cuelume-press="bloom"
                          className="text-primary underline underline-offset-2 hover:opacity-80 cursor-pointer break-words"
                        >
                          {children}
                        </a>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-1 pb-1">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-semibold mb-1 pb-1">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-semibold mb-1">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-base font-semibold mb-0.5">
                          {children}
                        </h4>
                      ),
                      h5: ({ children }) => (
                        <h5 className="text-sm font-semibold mt-2 mb-0.5">
                          {children}
                        </h5>
                      ),
                      h6: ({ children }) => (
                        <h6 className="text-xs font-semibold mt-2 mb-0.5 text-muted-foreground">
                          {children}
                        </h6>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-outside pl-5 space-y-0.5 mt-0">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-outside pl-5 space-y-0.5">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-sm leading-snug pl-0">
                          {children}
                        </li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/40 pl-3 my-1 text-muted-foreground italic">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children, className }) => {
                        const isBlock = className?.includes("language-");
                        return isBlock ? (
                          <code className={className}>{children}</code>
                        ) : (
                          <code className="bg-muted text-foreground rounded px-1 py-0.5 text-xs font-mono">
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-muted rounded-md px-3 py-2 my-1 overflow-x-auto text-xs font-mono">
                          {children}
                        </pre>
                      ),
                      hr: () => <hr className="border-border my-3!" />,
                      strong: ({ children }) => (
                        <strong className="font-semibold">{children}</strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-2">
                          <table className="w-full text-sm border-collapse">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="border-b border-border">
                          {children}
                        </thead>
                      ),
                      th: ({ children }) => (
                        <th className="px-3 py-1.5 text-left font-semibold text-foreground">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-3 py-1.5 border-b border-border/50 text-foreground">
                          {children}
                        </td>
                      ),
                      p: ({ children }) => (
                        <p className="mb-1.5 last:mb-0 mt-0 text-sm">
                          {children}
                        </p>
                      ),
                    }}
                  >
                    {note.content}
                  </Markdown>
                </div>
                {note.resolvedAttachments &&
                  note.resolvedAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {note.resolvedAttachments.map(({ fileName, dataUrl }) =>
                        dataUrl.startsWith("data:image/") ? (
                          <Dialog key={fileName}>
                            <DialogTrigger className="cursor-zoom-in">
                              <img
                                src={dataUrl}
                                alt={fileName}
                                className="max-h-48 rounded-md object-cover"
                                onContextMenu={() =>
                                  setContextMenuImage(dataUrl)
                                }
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
                        ) : (
                          <button
                            key={fileName}
                            onClick={() =>
                              window.ipcRenderer.invoke(
                                "open-file",
                                dataUrl,
                                fileName,
                              )
                            }
                            className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted hover:bg-muted/70 transition-colors text-sm max-w-56 cursor-pointer"
                          >
                            <FileAttachmentIcon
                              dataUrl={dataUrl}
                              className="size-4 shrink-0 text-muted-foreground"
                            />
                            <span className="truncate">{fileName}</span>
                          </button>
                        ),
                      )}
                    </div>
                  )}
              </>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent>
          {contextMenuImage && (
            <>
              <ContextMenuItem onClick={handleCopyImage}>
                <Copy />
                Copy Image
              </ContextMenuItem>
              <ContextMenuSeparator />
            </>
          )}
          {actions.map((action, i) => {
            if ("separator" in action) return <ContextMenuSeparator key={i} />;
            return (
              <ContextMenuItem
                key={action.label}
                variant={action.variant}
                onClick={action.onClick}
              >
                {action.icon}
                {action.label}
              </ContextMenuItem>
            );
          })}
        </ContextMenuContent>
      </ContextMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <ConfirmationDialog
          title="Delete note"
          description="Are you sure you want to delete this note? This action cannot be undone."
          action={deleteNote}
        />
      </Dialog>

      <FolderSelectDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        notesDirectory={notesDirectory}
        activeFolder={activeFolder}
        onSelect={handleMoveNote}
      />
    </>
  );
};

const FileAttachmentIcon = ({
  dataUrl,
  className,
}: {
  dataUrl: string;
  className?: string;
}) => {
  const mime = dataUrl.split(";")[0].replace("data:", "");
  if (mime.startsWith("video/")) return <FileVideo className={className} />;
  if (mime.startsWith("audio/")) return <FileAudio className={className} />;
  if (
    mime.startsWith("text/") ||
    mime === "application/json" ||
    mime === "application/xml"
  )
    return <FileCode className={className} />;
  if (
    mime === "application/pdf" ||
    mime.includes("word") ||
    mime.includes("document")
  )
    return <FileText className={className} />;
  return <File className={className} />;
};
