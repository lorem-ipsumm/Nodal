import type { Note, PinnedNote } from "@/lib/types";
import type {
  NodalApi,
  PaginatedNotes,
  SelectedFile,
} from "./nodal-api";

const DEMO_WORKSPACE = "demo-workspace";

const now = Date.now();
const demoFolders: Record<string, Note[]> = {
  weclome: [
    {
      folderName: String(now - 1000 * 60 * 15),
      content:
        "# Welcome to Nodal\n\nCapture thoughts as they happen, then organize them when you are ready.\n\nThis browser demo uses sample data. Try editing a note, creating a new one, or switching folders.",
      timestamp: now - 1000 * 60 * 15,
      attachments: [],
    },
    {
      folderName: String(now - 1000 * 60 * 45),
      content:
        "# A calmer place for ideas\n\nNodal keeps your notes close, flexible, and easy to revisit.",
      timestamp: now - 1000 * 60 * 45,
      attachments: [],
    },
  ],
  features: [
    {
      folderName: String(now - 1000 * 60 * 60),
      content:
        "# Features to explore\n\n- Capture notes quickly\n- Organize with folders\n- Pin important thoughts\n- Write in Markdown\n- Keep your workspace focused",
      timestamp: now - 1000 * 60 * 60,
      attachments: [],
    },
  ],
  "reading list": [
    {
      folderName: String(now - 1000 * 60 * 60 * 4),
      content:
        "# Designing tools people return to\n\nA good tool should get out of the way. Keep the interaction quick, the structure flexible, and the content easy to revisit.",
      timestamp: now - 1000 * 60 * 60 * 4,
      attachments: [],
    },
  ],
  ideas: [
    {
      folderName: String(now - 1000 * 60 * 60 * 8),
      content:
        "# Quiet tools for focused work\n\nWhat would a calmer workspace look like?\n\n- Fewer notifications\n- Notes close to the work\n- Simple organization\n- Easy search",
      timestamp: now - 1000 * 60 * 60 * 8,
      attachments: [],
    },
  ],
};

let pinnedNotes: PinnedNote[] = [];

const folderNameFromPath = (folderPath: string) =>
  folderPath.split(/[\\/]/).filter(Boolean).pop() ?? "Inbox";

const noteFromPath = (notePath: string) => {
  const parts = notePath.split(/[\\/]/).filter(Boolean);
  return {
    folder: parts[parts.length - 2] ?? "Inbox",
    noteId: parts[parts.length - 1] ?? "",
  };
};

const cloneNotes = (notes: Note[]) => notes.map((note) => ({ ...note }));

const selectFiles = (): Promise<SelectedFile[]> =>
  new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files ?? []);
      Promise.all(
        files.map(
          (file) =>
            new Promise<SelectedFile>((fileResolve) => {
              const reader = new FileReader();
              reader.onload = () =>
                fileResolve({
                  filePath: `browser:${file.name}`,
                  dataUrl: String(reader.result),
                });
              reader.readAsDataURL(file);
            }),
        ),
      ).then(resolve);
    };
    input.oncancel = () => resolve([]);
    input.click();
  });

export const createDemoApi = (): NodalApi => ({
  getPinnedNotes: async () => pinnedNotes,
  pinNote: async (note) => {
    if (!pinnedNotes.some((pin) => pin.folderName === note.folderName)) {
      pinnedNotes = [...pinnedNotes, note];
    }
    return pinnedNotes;
  },
  unpinNote: async (folderName) => {
    pinnedNotes = pinnedNotes.filter((note) => note.folderName !== folderName);
    return pinnedNotes;
  },
  getWorkspace: async () => DEMO_WORKSPACE,
  selectWorkspace: async () => DEMO_WORKSPACE,
  getFolders: async () => Object.keys(demoFolders),
  createFolder: async (folderPath) => {
    const folder = folderNameFromPath(folderPath);
    demoFolders[folder] ??= [];
  },
  deleteFolder: async (folderPath) => {
    delete demoFolders[folderNameFromPath(folderPath)];
  },
  renameFolder: async (oldPath, newPath) => {
    const oldName = folderNameFromPath(oldPath);
    const newName = folderNameFromPath(newPath);
    demoFolders[newName] = demoFolders[oldName] ?? [];
    delete demoFolders[oldName];
  },
  getNotesPaginated: async (folderPath): Promise<PaginatedNotes> => ({
    notes: cloneNotes(demoFolders[folderNameFromPath(folderPath)] ?? []),
    hasMore: false,
  }),
  createNote: async (folderPath, folderName, content) => {
    const folder = folderNameFromPath(folderPath);
    demoFolders[folder] ??= [];
    demoFolders[folder].push({
      folderName,
      content,
      timestamp: Number(folderName),
      attachments: [],
    });
    return `${folderPath}/${folderName}`;
  },
  updateNote: async (notePath, content) => {
    const { folder, noteId } = noteFromPath(notePath);
    const note = demoFolders[folder]?.find((item) => item.folderName === noteId);
    if (note) note.content = content;
  },
  deleteNote: async (notePath) => {
    const { folder, noteId } = noteFromPath(notePath);
    demoFolders[folder] = (demoFolders[folder] ?? []).filter(
      (note) => note.folderName !== noteId,
    );
  },
  moveNote: async (sourcePath, destinationFolderPath) => {
    const source = noteFromPath(sourcePath);
    const note = demoFolders[source.folder]?.find(
      (item) => item.folderName === source.noteId,
    );
    if (!note) return;
    demoFolders[source.folder] = (demoFolders[source.folder] ?? []).filter(
      (item) => item.folderName !== source.noteId,
    );
    const destination = folderNameFromPath(destinationFolderPath);
    demoFolders[destination] ??= [];
    demoFolders[destination].push(note);
  },
  selectFiles,
  readAttachments: async () => [],
  writeTempFile: async (_dataUrl, fileName) => `browser:${fileName}`,
  copyAttachments: async () => [],
  openFile: async (dataUrl, fileName) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    link.click();
  },
  openExternal: async (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  },
  fetchTweet: async () => null,
  fetchOg: async () => null,
  windowMinimize: async () => undefined,
  windowMaximize: async () => undefined,
  windowClose: async () => undefined,
});
