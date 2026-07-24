import { useState } from "react";
import { Dialog } from "./ui/dialog";
import { Input } from "./ui/input";
import { ConfirmationDialog } from "./ui/confirmation-dialog";
import { useSidebarStore } from "@/lib/hooks/store/use-sidebar-store";

interface CreateCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateCategoryDialog = ({
  open,
  onOpenChange,
}: CreateCategoryDialogProps) => {
  const [name, setName] = useState("");
  const { addCategory } = useSidebarStore();

  const handleCreate = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setName("");
    onOpenChange(false);
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) setName("");
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <ConfirmationDialog
        title="New Category"
        description={
          <Input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
            }}
            placeholder="Category name..."
          />
        }
        action={handleCreate}
      />
    </Dialog>
  );
};
