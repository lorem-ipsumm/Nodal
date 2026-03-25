import { ReactNode, useState } from "react";
import { Note } from "@/lib/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { ConfirmationDialog } from "../ui/confirmation-dialog";
import { MarkdownEditor } from "./markdown-editor";

interface NoteItemProps {
  note: Note;
}

export const NoteItem = ({ note }: NoteItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const { notesDirectory, activeFolder, updateNote } = useAppStore();

  const handleSave = async () => {
    const trimmed = editContent.trim();
    if (!trimmed || !notesDirectory || !activeFolder) return;
    const notePath = `${notesDirectory}/${activeFolder}/${note.folderName}`;
    await window.ipcRenderer.invoke("update-note", notePath, trimmed);
    updateNote(note.folderName, trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(note.content);
    setIsEditing(false);
  };

  return (
    <div className="group rounded-lg px-4 py-3 hover:bg-popover relative">
      {!isEditing && (
        <NoteActions
          note={note}
          className="hidden group-hover:flex"
          onEdit={() => {
            setEditContent(note.content);
            setIsEditing(true);
          }}
        />
      )}

      {isEditing ? (
        <div className="bg-popover rounded-lg border flex flex-col">
          <section className="flex">
            <MarkdownEditor
              value={editContent}
              onChange={setEditContent}
              onSubmit={handleSave}
              onCancel={handleCancel}
              placeholder="Edit note..."
              className="flex-1 min-w-0 px-3 min-h-16"
              autoFocus
            />
          </section>
          <section className="flex justify-end gap-2 px-3 py-2 border-t">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
            </Button>
          </section>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

const NoteActions = ({
  note,
  className,
  onEdit,
}: {
  note: Note;
  className?: string;
  onEdit: () => void;
}) => {
  const { notesDirectory, activeFolder, removeNote } = useAppStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deleteNote = () => {
    if (!notesDirectory || !activeFolder) return;
    const notePath = `${notesDirectory}/${activeFolder}/${note.folderName}`;
    window.ipcRenderer.invoke("delete-note", notePath).then(() => {
      removeNote(note.folderName);
    });
  };

  const handleDelete = (e?: React.MouseEvent) => {
    if (e?.shiftKey) {
      deleteNote();
    } else {
      setConfirmOpen(true);
    }
  };

  const ActionButton = ({
    hint,
    onClick,
    icon,
  }: {
    hint: ReactNode;
    onClick: (e?: React.MouseEvent) => void;
    icon: ReactNode;
  }) => {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Button variant="ghost" onClick={onClick}>
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div
      className={cn(
        "bg-popover absolute right-0 -top-2 border rounded-md shadow-sm",
        className,
      )}
    >
      <ActionButton hint="Edit" icon={<Edit2 />} onClick={() => onEdit()} />
      <ActionButton
        hint="Delete"
        icon={<Trash2 className="text-destructive" />}
        onClick={handleDelete}
      />
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <ConfirmationDialog
          title="Delete note"
          description="Are you sure you want to delete this note? This action cannot be undone."
          action={deleteNote}
        />
      </Dialog>
    </div>
  );
};
