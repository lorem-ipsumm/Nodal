import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { NoteAction } from "@/lib/types";

export const NoteActions = ({
  className,
  actions,
}: {
  className?: string;
  actions: NoteAction[];
}) => {
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
          <Button variant="ghost" onClick={onClick} data-cuelume-press="click">
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
    );
  };

  const visibleActions = actions.filter(
    (a): a is Extract<NoteAction, { label: string }> =>
      !("separator" in a) && !a.contextMenuOnly,
  );

  return (
    <div
      className={cn(
        "bg-popover absolute right-2 -top-4 border rounded-md shadow-sm z-10",
        className,
      )}
    >
      {visibleActions.map((action) => (
        <ActionButton
          key={action.label}
          hint={action.label}
          icon={
            action.variant === "destructive" ? (
              <span className="text-destructive">{action.icon}</span>
            ) : (
              action.icon
            )
          }
          onClick={action.onClick}
        />
      ))}
    </div>
  );
};
