import type { Tweet } from "react-tweet/api";
import type { Note, PinnedNote } from "@/lib/types";

export type SelectedFile = {
  filePath: string;
  dataUrl: string;
};

export type PaginatedNotes = {
  notes: Note[];
  hasMore: boolean;
};

export type WorkspaceMetadata = {
  version: 1;
  categories: {
    id: string;
    name: string;
    collapsed: boolean;
    folderNames: string[];
  }[];
  uncategorizedFolders: string[];
};

export type OgData = {
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  url: string;
};

export type NodalApi = {
  getPinnedNotes: () => Promise<PinnedNote[]>;
  pinNote: (note: PinnedNote) => Promise<PinnedNote[]>;
  unpinNote: (folderName: string) => Promise<PinnedNote[]>;
  getWorkspace: () => Promise<string | undefined>;
  selectWorkspace: () => Promise<string | null>;
  getWorkspaceMetadata: (workspace: string) => Promise<WorkspaceMetadata | null>;
  saveWorkspaceMetadata: (
    workspace: string,
    metadata: WorkspaceMetadata,
  ) => Promise<void>;
  getFolders: (dirPath?: string) => Promise<string[]>;
  createFolder: (folderPath: string) => Promise<void>;
  deleteFolder: (folderPath: string) => Promise<void>;
  renameFolder: (oldPath: string, newPath: string) => Promise<void>;
  getNotesPaginated: (
    folderPath: string,
    offset: number,
    limit: number,
  ) => Promise<PaginatedNotes>;
  createNote: (
    folderPath: string,
    folderName: string,
    content: string,
  ) => Promise<string>;
  updateNote: (notePath: string, content: string) => Promise<void>;
  deleteNote: (notePath: string) => Promise<void>;
  moveNote: (
    sourcePath: string,
    destinationFolderPath: string,
  ) => Promise<void>;
  selectFiles: () => Promise<SelectedFile[]>;
  readAttachments: (
    notePath: string,
    attachments: string[],
  ) => Promise<{ fileName: string; dataUrl: string }[]>;
  writeTempFile: (dataUrl: string, fileName: string) => Promise<string>;
  copyAttachments: (notePath: string, filePaths: string[]) => Promise<string[]>;
  openFile: (dataUrl: string, fileName: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  fetchTweet: (tweetId: string) => Promise<Tweet | null>;
  fetchOg: (url: string) => Promise<OgData | null>;
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
};

type IpcRenderer = {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
};

const invoke = <T>(ipcRenderer: IpcRenderer, channel: string, ...args: unknown[]) =>
  ipcRenderer.invoke(channel, ...args) as Promise<T>;

export const createElectronApi = (ipcRenderer: IpcRenderer): NodalApi => ({
  getPinnedNotes: () => invoke(ipcRenderer, "get-pinned-notes"),
  pinNote: (note) => invoke(ipcRenderer, "pin-note", note),
  unpinNote: (folderName) => invoke(ipcRenderer, "unpin-note", folderName),
  getWorkspace: () => invoke(ipcRenderer, "get-workspace"),
  selectWorkspace: () => invoke(ipcRenderer, "select-workspace"),
  getWorkspaceMetadata: (workspace) =>
    invoke(ipcRenderer, "get-workspace-metadata", workspace),
  saveWorkspaceMetadata: (workspace, metadata) =>
    invoke(ipcRenderer, "save-workspace-metadata", workspace, metadata),
  getFolders: (dirPath) => invoke(ipcRenderer, "get-folders", dirPath),
  createFolder: (folderPath) => invoke(ipcRenderer, "create-folder", folderPath),
  deleteFolder: (folderPath) => invoke(ipcRenderer, "delete-folder", folderPath),
  renameFolder: (oldPath, newPath) =>
    invoke(ipcRenderer, "rename-folder", oldPath, newPath),
  getNotesPaginated: (folderPath, offset, limit) =>
    invoke(ipcRenderer, "get-notes-paginated", folderPath, offset, limit),
  createNote: (folderPath, folderName, content) =>
    invoke(ipcRenderer, "create-note", folderPath, folderName, content),
  updateNote: (notePath, content) => invoke(ipcRenderer, "update-note", notePath, content),
  deleteNote: (notePath) => invoke(ipcRenderer, "delete-note", notePath),
  moveNote: (sourcePath, destinationFolderPath) =>
    invoke(ipcRenderer, "move-note", sourcePath, destinationFolderPath),
  selectFiles: () => invoke(ipcRenderer, "select-files"),
  readAttachments: (notePath, attachments) =>
    invoke(ipcRenderer, "read-attachments", notePath, attachments),
  writeTempFile: (dataUrl, fileName) =>
    invoke(ipcRenderer, "write-temp-file", dataUrl, fileName),
  copyAttachments: (notePath, filePaths) =>
    invoke(ipcRenderer, "copy-attachments", notePath, filePaths),
  openFile: (dataUrl, fileName) => invoke(ipcRenderer, "open-file", dataUrl, fileName),
  openExternal: (url) => invoke(ipcRenderer, "open-external", url),
  fetchTweet: (tweetId) => invoke(ipcRenderer, "fetch-tweet", tweetId),
  fetchOg: (url) => invoke(ipcRenderer, "fetch-og", url),
  windowMinimize: () => invoke(ipcRenderer, "window-minimize"),
  windowMaximize: () => invoke(ipcRenderer, "window-maximize"),
  windowClose: () => invoke(ipcRenderer, "window-close"),
});

let nodalApi: NodalApi | undefined;

export const setNodalApi = (api: NodalApi) => {
  nodalApi = api;
};

export const getNodalApi = (): NodalApi => {
  if (!nodalApi) {
    throw new Error("Nodal API has not been configured.");
  }
  return nodalApi;
};
