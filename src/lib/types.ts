export interface Note {
  folderName: string;
  content: string;
  timestamp: number;
  attachments: string[];
  resolvedAttachments?: { fileName: string; dataUrl: string }[];
}
