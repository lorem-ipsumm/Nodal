import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

export type UpdateState = {
  version?: string;
  downloaded: boolean;
  downloading: boolean;
  progress: number;
  error?: string;
};

type UpdateAvailablePayload = {
  update?: boolean;
  newVersion?: string;
};

type DownloadProgressPayload = {
  percent?: number;
};

interface UpdateNotificationProps {
  initialUpdate?: UpdateState | null;
}

export const UpdateNotification = ({
  initialUpdate = null,
}: UpdateNotificationProps) => {
  const [update, setUpdate] = useState<UpdateState | null>(initialUpdate);

  useEffect(() => {
    const ipcRenderer = window.ipcRenderer;
    if (!ipcRenderer) return;

    const handleUpdateAvailable = (
      _event: unknown,
      payload: UpdateAvailablePayload,
    ) => {
      if (!payload?.update) return;
      setUpdate({
        version: payload.newVersion,
        downloaded: false,
        downloading: false,
        progress: 0,
      });
    };
    const handleDownloadProgress = (
      _event: unknown,
      payload: DownloadProgressPayload,
    ) => {
      setUpdate((current) =>
        current
          ? {
              ...current,
              downloading: true,
              progress: Math.round(payload?.percent ?? 0),
            }
          : current,
      );
    };
    const handleUpdateDownloaded = () => {
      setUpdate((current) =>
        current
          ? { ...current, downloaded: true, downloading: false, progress: 100 }
          : current,
      );
    };
    const handleUpdateError = (
      _event: unknown,
      payload: { message?: string },
    ) => {
      setUpdate((current) =>
        current
          ? {
              ...current,
              downloading: false,
              error: payload?.message ?? "Unable to download the update.",
            }
          : current,
      );
    };

    ipcRenderer.on("update-can-available", handleUpdateAvailable);
    ipcRenderer.on("download-progress", handleDownloadProgress);
    ipcRenderer.on("update-downloaded", handleUpdateDownloaded);
    ipcRenderer.on("update-error", handleUpdateError);
    void ipcRenderer.invoke("check-update");

    return () => {
      ipcRenderer.off("update-can-available", handleUpdateAvailable);
      ipcRenderer.off("download-progress", handleDownloadProgress);
      ipcRenderer.off("update-downloaded", handleUpdateDownloaded);
      ipcRenderer.off("update-error", handleUpdateError);
    };
  }, []);

  if (!update) return null;

  const handleInstall = () => {
    if (update.downloaded) {
      void window.ipcRenderer.invoke("quit-and-install");
      return;
    }

    setUpdate((current) =>
      current ? { ...current, downloading: true, error: undefined } : current,
    );
    void window.ipcRenderer.invoke("start-download");
  };

  return (
    <aside className="fixed bottom-8 right-8 z-50 w-[min( calc(100vw-2rem),24rem)] rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-primary/10 p-2 text-primary">
          {update.downloading ? (
            <RefreshCw className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Nodal update available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {update.downloaded
              ? "The update is ready to install."
              : update.version
                ? `Version ${update.version} is available.`
                : "A new version is available."}
          </p>
          {update.downloading && (
            <p className="mt-2 text-xs text-muted-foreground">
              Downloading… {update.progress}%
            </p>
          )}
          {update.error && (
            <p className="mt-2 text-xs text-destructive">{update.error}</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">

        <Button size="sm" onClick={handleInstall} disabled={update.downloading}>
          {update.downloaded ? "Restart and install" : "Install now and restart"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUpdate(null)}
          disabled={update.downloading}
        >
          Install later
        </Button>
      </div>
    </aside>
  );
};
