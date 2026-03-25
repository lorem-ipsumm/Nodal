import { cn } from "@/lib/utils";

export const Divider = ({ className }: { className?: string }) => {
  return <div className={cn("h-px w-full bg-border", className)} />;
};
