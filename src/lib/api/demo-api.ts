import type { Note, PinnedNote } from "@/lib/types";
import type {
  NodalApi,
  PaginatedNotes,
  SelectedFile,
} from "./nodal-api";

const DEMO_WORKSPACE = "demo-workspace";

const demoFiles = import.meta.glob("../../../web/demo-content/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const demoFolders = Object.entries(demoFiles).reduce<Record<string, Note[]>>(
  (folders, [filePath, content], index) => {
    const relativePath = filePath.split("/demo-content/")[1];
    if (!relativePath) return folders;

    const parts = relativePath.split("/");
    const folder = parts[0];
    const fileName =
      parts[parts.length - 1]?.replace(/\.md$/, "") ?? "";
    if (!folder || !fileName) return folders;

    const timestamp = Number(fileName) || Date.now() - index * 1000 * 60;
    folders[folder] ??= [];
    folders[folder].push({
      folderName: fileName,
      content,
      timestamp,
      attachments: [],
    });
    return folders;
  },
  {},
);

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
