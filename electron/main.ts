import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import fs from "node:fs";
import os from "node:os";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { update } from "./update";
import Store from "electron-store";

const store = new Store<{ workspace: string | undefined }>({
  defaults: { workspace: undefined },
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
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
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
    .filter((entry) => entry.isDirectory())
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

ipcMain.handle("select-images", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "webp"] },
    ],
  });
  if (canceled) return [];
  return filePaths.map((filePath) => {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mime = ext === "jpg" ? "jpeg" : ext;
    const dataUrl = `data:image/${mime};base64,${data.toString("base64")}`;
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
      const mime = ext === "jpg" ? "jpeg" : ext;
      const dataUrl = `data:image/${mime};base64,${data.toString("base64")}`;
      return { fileName, dataUrl };
    });
  },
);

ipcMain.handle(
  "write-temp-image",
  (_event, dataUrl: string, fileName: string) => {
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const tempPath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tempPath, buffer);
    return tempPath;
  },
);

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

ipcMain.handle("delete-folder", (_event, folderPath: string) => {
  fs.rmSync(folderPath, { recursive: true, force: true });
});

ipcMain.handle("create-folder", (_event, folderPath: string) => {
  fs.mkdirSync(folderPath, { recursive: true });
});

ipcMain.handle("rename-folder", (_event, oldPath: string, newPath: string) => {
  fs.renameSync(oldPath, newPath);
});

ipcMain.handle("update-note", (_event, notePath: string, content: string) => {
  fs.writeFileSync(path.join(notePath, "note.md"), content, "utf-8");
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
