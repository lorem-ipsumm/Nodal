import type { Note } from "@/lib/types";
import type { Tweet } from "react-tweet/api";
import type {
  NodalApi,
  PaginatedNotes,
  SelectedFile,
  WindowFrameStyle,
  WorkspaceMetadata,
} from "./nodal-api";

const DEMO_WORKSPACE = "demo-content";


const demoFiles = import.meta.glob("../../../web/demo-content/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
}) as Record<string, string>;

const demoFolderMarkers = import.meta.glob(
  "../../../web/demo-content/**/.gitkeep",
  { eager: true },
) as Record<string, unknown>;

const demoMetadataFiles = import.meta.glob(
  "../../../web/demo-content/.nodal/workspace.json",
  { eager: true, import: "default", query: "?raw" },
) as Record<string, string>;

const demoMetadataContent = Object.values(demoMetadataFiles)[0];
const demoAttachments = import.meta.glob(
  "../../../web/demo-content/**/*.{png,jpg,jpeg,gif,webp,svg}",
  { eager: true, import: "default", query: "?url" },
) as Record<string, string>;

const initialWorkspaceMetadata = demoMetadataContent
  ? (JSON.parse(demoMetadataContent) as WorkspaceMetadata)
  : null;

const demoFolders = Object.keys(demoFolderMarkers).reduce<Record<string, Note[]>>(
  (folders, filePath) => {
    const relativePath = filePath.split("/demo-content/")[1];
    const folder = relativePath?.split("/")[0];
    if (folder) folders[folder] ??= [];
    return folders;
  },
  Object.entries(demoFiles).reduce<Record<string, Note[]>>(
    (folders, [filePath, content], index) => {
      const relativePath = filePath.split("/demo-content/")[1];
      if (!relativePath) return folders;

      const parts = relativePath.split("/");
      const folder = parts[0];
      const fileName =
        parts[parts.length - 1]?.replace(/\.md$/, "") ?? "";
      const noteFolderName = parts[parts.length - 2] ?? "";
      if (!folder || !fileName || !noteFolderName) return folders;

      const timestamp =
        Number(noteFolderName) || Date.now() - index * 1000 * 60;
      folders[folder] ??= [];
      folders[folder].push({
        folderName: noteFolderName,
        content,
        timestamp,
        attachments: [],
      });
      return folders;
    },
    {},
  ),
);

Object.entries(demoFolders).forEach(([folder, notes]) => {
  notes.forEach((note) => {
    note.attachments = Object.keys(demoAttachments)
      .filter((filePath) =>
        filePath
          .replace(/\\/g, "/")
          .includes(`/${folder}/${note.folderName}/`),
      )
      .map((filePath) => filePath.split("/").pop() ?? "")
      .filter(Boolean);
  });
});

let workspaceMetadata: WorkspaceMetadata | null = initialWorkspaceMetadata;

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

const demoTweet: Tweet = {
  id_str: "2088651740451410338",
  text: "Gaussian splats are like magic. I'm basically preserving scenes from my life in amber",
  created_at: "2026-08-15T11:39:00.000Z",
  user: {
    id_str: "demo-user",
    name: "lorem",
    screen_name: "lorem___",
    profile_image_url_https:
      "https://pbs.twimg.com/profile_images/1957579877666973696/7V6K3x6K_normal.jpg",
  },
  entities: { urls: [], media: [] },
} as unknown as Tweet;

const findDemoAttachment = (folderPath: string, fileName: string) => {
  const normalizedFolderPath = folderPath.replace(/\\/g, "/");
  const assetPath = Object.keys(demoAttachments).find((filePath) =>
    filePath.replace(/\\/g, "/").endsWith(
      `/${normalizedFolderPath.split("/").slice(-2).join("/")}/${fileName}`,
    ),
  );
  return assetPath ? demoAttachments[assetPath] : null;
};

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
  getPinnedNotes: async () => workspaceMetadata?.pinnedNotes ?? [],
  pinNote: async (note) => {
    const pins = workspaceMetadata?.pinnedNotes ?? [];
    if (!pins.some((pin) => pin.folderName === note.folderName && pin.folder === note.folder)) {
      workspaceMetadata = {
        version: 1,
        categories: workspaceMetadata?.categories ?? [],
        uncategorizedFolders: workspaceMetadata?.uncategorizedFolders ?? [],
        ...workspaceMetadata,
        pinnedNotes: [...pins, note],
      };
    }
    return workspaceMetadata?.pinnedNotes ?? [];
  },
  unpinNote: async (folderName) => {
    if (workspaceMetadata) {
      workspaceMetadata = {
        ...workspaceMetadata,
        pinnedNotes: (workspaceMetadata.pinnedNotes ?? []).filter(
          (note) => note.folderName !== folderName,
        ),
      };
    }
    return workspaceMetadata?.pinnedNotes ?? [];
  },
  getAppVersion: async () => "1.2.0",
  getWindowFrameStyle: async (): Promise<WindowFrameStyle> => "native",
  setWindowFrameStyle: async () => undefined,
  getWorkspace: async () => DEMO_WORKSPACE,
  selectWorkspace: async () => DEMO_WORKSPACE,
  getWorkspaceMetadata: async () => workspaceMetadata,
  saveWorkspaceMetadata: async (_workspace, metadata) => {
    workspaceMetadata = {
      ...metadata,
      ...(workspaceMetadata?.pinnedNotes && !("pinnedNotes" in metadata)
        ? { pinnedNotes: workspaceMetadata.pinnedNotes }
        : {}),
    };
  },
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
  readAttachments: async (notePath, attachments) =>
    attachments.flatMap((fileName) => {
      const dataUrl = findDemoAttachment(notePath, fileName);
      return dataUrl ? [{ fileName, dataUrl }] : [];
    }),
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
  fetchTweet: async (tweetId) =>
    tweetId === demoTweet.id_str ? demoTweet : null,
  fetchOg: async (url) => {
    try {
      const parsedUrl = new URL(url);
      return {
        title: parsedUrl.hostname,
        description: `Open ${parsedUrl.hostname} in a new tab.`,
        image: null,
        siteName: parsedUrl.hostname,
        url,
      };
    } catch {
      return null;
    }
  },
  windowMinimize: async () => undefined,
  windowMaximize: async () => undefined,
  windowClose: async () => undefined,
});
