import { ReactNode } from "react";

export interface Note {
  folderName: string;
  content: string;
  timestamp: number;
  attachments: string[];
  resolvedAttachments?: { fileName: string; dataUrl: string }[];
}

export interface PinnedNote {
  folderName: string;
  folder: string;
  contentPreview: string;
}

export type NoteAction =
  | {
      label: string;
      icon: ReactNode;
      onClick: (e?: React.MouseEvent) => void;
      variant?: "destructive";
      separator?: never;
      contextMenuOnly?: boolean;
    }
  | { separator: true };
