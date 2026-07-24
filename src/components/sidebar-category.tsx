import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarCategory as SidebarCategoryType, useSidebarStore } from "@/lib/hooks/store/use-sidebar-store";
import { SidebarFolderItem } from "./sidebar-folder-item";
import { CategoryContextMenu } from "./category-context-menu";

interface SidebarCategoryProps {
  category: SidebarCategoryType;
  onFolderRenamed: (oldName: string, newName: string) => void;
  onFolderDeleted: (name: string) => void;
}

export const SidebarCategorySection = ({
  category,
  onFolderRenamed,
  onFolderDeleted,
}: SidebarCategoryProps) => {
  const { toggleCategory } = useSidebarStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* Category header — draggable + right-clickable */}
      <CategoryContextMenu categoryId={category.id} categoryName={category.name}>
        <div
          {...attributes}
          {...listeners}
          className="flex items-center gap-1 px-1 py-0.5 rounded cursor-grab active:cursor-grabbing hover:bg-accent select-none"
          onClick={() => toggleCategory(category.id)}
        >
          <ChevronRightIcon
            size={12}
            className={cn(
              "text-muted-foreground shrink-0 transition-transform duration-150",
              !category.collapsed && "rotate-90",
            )}
          />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
            {category.name}
          </span>
        </div>
      </CategoryContextMenu>

      {/* Folder list */}
      {!category.collapsed && (
        <SortableContext
          items={category.folderNames}
          strategy={verticalListSortingStrategy}
        >
          <div className="ml-2 mt-0.5 flex flex-col gap-1">
            {category.folderNames.map((folder) => (
              <SidebarFolderItem
                key={folder}
                folder={folder}
                onRenamed={onFolderRenamed}
                onDeleted={onFolderDeleted}
              />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
};
