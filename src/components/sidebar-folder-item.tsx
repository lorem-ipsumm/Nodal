import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FolderIcon } from "lucide-react";
import { Button } from "./ui/button";
import { FolderContextMenu } from "./folder-context-menu";
import { useAppStore } from "@/lib/hooks/store/use-app-store";

interface SidebarFolderItemProps {
  folder: string;
  onRenamed: (oldName: string, newName: string) => void;
  onDeleted: (name: string) => void;
}

export const SidebarFolderItem = ({
  folder,
  onRenamed,
  onDeleted,
}: SidebarFolderItemProps) => {
  const { activeFolder, setActiveFolder } = useAppStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: folder });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <FolderContextMenu
        folder={folder}
        onRenamed={onRenamed}
        onDeleted={onDeleted}
      >
        <Button
          className="justify-start cursor-grab active:cursor-grabbing w-full"
          variant={activeFolder === folder ? "default" : "ghost"}
          onClick={() => setActiveFolder(folder)}
          data-cuelume-press="click"
        >
          <FolderIcon size={14} className="shrink-0" />
          <span className="truncate">{folder}</span>
        </Button>
      </FolderContextMenu>
    </div>
  );
};
