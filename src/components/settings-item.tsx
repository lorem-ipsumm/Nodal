import type { ReactNode } from "react";

interface SettingsItemProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
}

export const SettingsItem = ({
  title,
  description,
  action,
  footer,
}: SettingsItemProps) => (
  <div className="rounded-lg border border-border bg-muted/30 p-4">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    {footer && <div className="mt-4 border-t border-border pt-3">{footer}</div>}
  </div>
);
