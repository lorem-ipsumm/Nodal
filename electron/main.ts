import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { fetchTweet } from "react-tweet/api";

const getMimeType = (ext: string): string => {
  const mimeTypes: Record<string, string> = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    bmp: "image/bmp",
    tiff: "image/tiff",
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Text / Code
    txt: "text/plain",
    md: "text/markdown",
    csv: "text/csv",
    json: "application/json",
    xml: "application/xml",
    js: "text/javascript",
    ts: "text/typescript",
    html: "text/html",
    css: "text/css",
    py: "text/x-python",
    rs: "text/x-rust",
    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    flac: "audio/flac",
    // Video
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    // Archives
    zip: "application/zip",
    tar: "application/x-tar",
    gz: "application/gzip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
  };
  return mimeTypes[ext] ?? "application/octet-stream";
};
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { update } from "./update";
import Store from "electron-store";

interface PinnedNote {
  folderName: string;
  folder: string;
  contentPreview: string;
}

const store = new Store<{
  workspace: string | undefined;
  pinnedNotes: PinnedNote[];
}>({
  defaults: { workspace: undefined, pinnedNotes: [] },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, "..");

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "nodal.png"),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs"),
    },
  });

  // Enable auto-update logic
  update(win);

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);

ipcMain.handle("get-pinned-notes", () => {
  return store.get("pinnedNotes");
});

ipcMain.handle("pin-note", (_event, note: PinnedNote) => {
  const pins = store.get("pinnedNotes");
  if (!pins.find((p) => p.folderName === note.folderName)) {
    store.set("pinnedNotes", [...pins, note]);
  }
  return store.get("pinnedNotes");
});

ipcMain.handle("unpin-note", (_event, folderName: string) => {
  const pins = store.get("pinnedNotes");
  store.set(
    "pinnedNotes",
    pins.filter((p) => p.folderName !== folderName),
  );
  return store.get("pinnedNotes");
});

ipcMain.handle("get-workspace", () => {
  return store.get("workspace");
});

ipcMain.handle("select-workspace", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "Select Workspace Folder",
  });
  if (canceled || filePaths.length === 0) return null;
  const selectedPath = filePaths[0];
  store.set("workspace", selectedPath);
  return selectedPath;
});

ipcMain.handle("get-folders", (_event, dirPath?: string) => {
  const targetPath = dirPath ?? app.getPath("desktop");
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && entry.name !== ".stfolder")
    .map((entry) => entry.name);
});

ipcMain.handle(
  "create-note",
  (_event, folderPath: string, folderName: string, content: string) => {
    const notePath = path.join(folderPath, folderName);
    fs.mkdirSync(notePath, { recursive: true });
    fs.writeFileSync(path.join(notePath, "note.md"), content, "utf-8");
    return notePath;
  },
);

ipcMain.handle("select-files", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  });
  if (canceled) return [];
  return filePaths.map((filePath) => {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = getMimeType(ext);
    const dataUrl = `data:${mime};base64,${data.toString("base64")}`;
    return { filePath, dataUrl };
  });
});

ipcMain.handle(
  "read-attachments",
  (_event, notePath: string, attachments: string[]) => {
    return attachments.map((fileName) => {
      const filePath = path.join(notePath, fileName);
      const data = fs.readFileSync(filePath);
      const ext = path.extname(fileName).slice(1).toLowerCase();
      const mime = getMimeType(ext);
      const dataUrl = `data:${mime};base64,${data.toString("base64")}`;
      return { fileName, dataUrl };
    });
  },
);

ipcMain.handle(
  "write-temp-file",
  (_event, dataUrl: string, fileName: string) => {
    const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const tempPath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
  },
);

ipcMain.handle("open-file", (_event, dataUrl: string, fileName: string) => {
  const base64Data = dataUrl.replace(/^data:[^;]+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  const tempPath = path.join(os.tmpdir(), fileName);
  fs.writeFileSync(tempPath, buffer);
  shell.openPath(tempPath);
});

ipcMain.handle(
  "copy-attachments",
  (_event, notePath: string, filePaths: string[]) => {
    fs.mkdirSync(notePath, { recursive: true });
    return filePaths.map((filePath) => {
      const fileName = path.basename(filePath);
      fs.copyFileSync(filePath, path.join(notePath, fileName));
      return fileName;
    });
  },
);

ipcMain.handle("open-external", (_event, url: string) => {
  shell.openExternal(url);
});

ipcMain.handle("delete-note", (_event, notePath: string) => {
  fs.rmSync(notePath, { recursive: true, force: true });
});

ipcMain.handle(
  "move-note",
  (_event, sourcePath: string, destinationFolderPath: string) => {
    const noteFolderName = path.basename(sourcePath);
    const destNotePath = path.join(destinationFolderPath, noteFolderName);
    fs.mkdirSync(destinationFolderPath, { recursive: true });
    fs.renameSync(sourcePath, destNotePath);
  },
);

ipcMain.handle("delete-folder", (_event, folderPath: string) => {
  fs.rmSync(folderPath, { recursive: true, force: true });
});

ipcMain.handle("create-folder", (_event, folderPath: string) => {
  fs.mkdirSync(folderPath, { recursive: true });
});

ipcMain.handle("window-minimize", () => {
  win?.minimize();
});

ipcMain.handle("window-maximize", () => {
  if (win?.isMaximized()) {
    win.unmaximize();
  } else {
    win?.maximize();
  }
});

ipcMain.handle("window-close", () => {
  win?.close();
});

ipcMain.handle("rename-folder", (_event, oldPath: string, newPath: string) => {
  fs.renameSync(oldPath, newPath);
});

ipcMain.handle("update-note", (_event, notePath: string, content: string) => {
  fs.writeFileSync(path.join(notePath, "note.md"), content, "utf-8");
});

ipcMain.handle("fetch-og", async (_event, url: string) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const html = await res.text();

    const extractMeta = (prop: string): string | null => {
      for (const attr of ["property", "name"]) {
        const patterns = [
          new RegExp(
            `<meta[^>]+${attr}=["']${prop}["'][^>]+content=["']([^"'<>]+)["']`,
            "i",
          ),
          new RegExp(
            `<meta[^>]+content=["']([^"'<>]+)["'][^>]+${attr}=["']${prop}["']`,
            "i",
          ),
        ];
        for (const pat of patterns) {
          const m = html.match(pat);
          if (m?.[1]) return m[1].trim();
        }
      }
      return null;
    };

    const titleMatch = html.match(/<title[^>]*>([^<]{1,300})<\/title>/i);

    return {
      title:
        extractMeta("og:title") || (titleMatch ? titleMatch[1].trim() : null),
      description: extractMeta("og:description") || extractMeta("description"),
      image: extractMeta("og:image"),
      siteName: extractMeta("og:site_name"),
      url,
    };
  } catch {
    return null;
  }
});

ipcMain.handle("fetch-tweet", async (_event, tweetId: string) => {
  try {
    const { data } = await fetchTweet(tweetId);
    return data ?? null;
  } catch {
    return null;
  }
});

ipcMain.handle("get-notes", (_event, folderPath: string) => {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const timestamp = parseInt(entry.name, 10);
      const notePath = path.join(folderPath, entry.name);
      const content = fs.readFileSync(path.join(notePath, "note.md"), "utf-8");
      const attachments = fs
        .readdirSync(notePath)
        .filter((file) => file !== "note.md");
      return { folderName: entry.name, content, timestamp, attachments };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
});

ipcMain.handle(
  "get-notes-paginated",
  (_event, folderPath: string, groupOffset: number, groupLimit: number) => {
    const GROUP_WINDOW_MS = 5 * 60 * 1000;

    // Read only directory names first (no file I/O for content yet)
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const allEntries = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        folderName: entry.name,
        timestamp: parseInt(entry.name, 10),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    // Build groups using the same 5-minute window logic as the frontend
    type Entry = { folderName: string; timestamp: number };
    const groups: Entry[][] = [];
    let currentGroup: Entry[] = [];

    for (let i = 0; i < allEntries.length; i++) {
      if (i === 0) {
        currentGroup.push(allEntries[i]);
      } else {
        const prev = allEntries[i - 1];
        const curr = allEntries[i];
        if (curr.timestamp - prev.timestamp > GROUP_WINDOW_MS) {
          groups.push(currentGroup);
          currentGroup = [curr];
        } else {
          currentGroup.push(curr);
        }
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);

    const totalGroups = groups.length;

    // Slice from the end: groupOffset=0 gets the latest groupLimit groups
    const endIdx = totalGroups - groupOffset;
    const startIdx = Math.max(0, endIdx - groupLimit);

    const selectedGroups = groups.slice(startIdx, endIdx);
    const hasMore = startIdx > 0;

    // Now read file content only for the selected notes
    const selectedNotes = selectedGroups.flat().map((entry) => {
      const notePath = path.join(folderPath, entry.folderName);
      const content = fs.readFileSync(path.join(notePath, "note.md"), "utf-8");
      const attachments = fs
        .readdirSync(notePath)
        .filter((file) => file !== "note.md");
      return {
        folderName: entry.folderName,
        content,
        timestamp: entry.timestamp,
        attachments,
      };
    });

    return { notes: selectedNotes, hasMore };
  },
);
