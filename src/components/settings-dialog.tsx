import { useEffect, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import {
  getNodalApi,
  type WindowFrameStyle,
} from "@/lib/api/nodal-api";
import { SettingsItem } from "./settings-item";
import { SettingsSection } from "./settings-section";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const releasesUrl = "https://github.com/lorem-ipsumm/Nodal/releases";
const frameStyleLabels: Record<WindowFrameStyle, string> = {
  hidden: "Hidden",
  nodal: "Nodal",
  native: "Native",
};

export const SettingsDialog = ({
  open,
  onOpenChange,
}: SettingsDialogProps) => {
  const [version, setVersion] = useState("Loading…");
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);
  const [savedWindowFrameStyle, setSavedWindowFrameStyle] =
    useState<WindowFrameStyle>("native");
  const [windowFrameStyle, setWindowFrameStyle] =
    useState<WindowFrameStyle>("native");

  useEffect(() => {
    if (!open) return;

    getNodalApi()
      .getAppVersion()
      .then(setVersion)
      .catch(() => setVersion("Unknown"));
    getNodalApi()
      .getWindowFrameStyle()
      .then((style) => {
        setSavedWindowFrameStyle(style);
        setWindowFrameStyle(style);
      });

    const ipcRenderer = window.ipcRenderer;
    if (!ipcRenderer) return;

    const handleUpdateResult = (
      _event: unknown,
      payload: { update?: boolean; newVersion?: string },
    ) => {
      setUpdateStatus(
        payload?.update
          ? `Version ${payload.newVersion ?? "new"} is available.`
          : "You are up to date.",
      );
    };

    ipcRenderer.on("update-can-available", handleUpdateResult);
    return () => {
      ipcRenderer.off("update-can-available", handleUpdateResult);
    };
  }, [open]);

  const handleReload = async () => {
    await getNodalApi().setWindowFrameStyle(windowFrameStyle);
    if (window.ipcRenderer) {
      void window.ipcRenderer.invoke("reload-app");
    } else {
      setSavedWindowFrameStyle(windowFrameStyle);
    }
  };

  const handleCheckForUpdates = () => {
    if (!window.ipcRenderer) {
      setUpdateStatus("Update checks are available in the desktop app.");
      return;
    }

    setUpdateStatus("Checking for updates…");
    void window.ipcRenderer
      .invoke("check-update")
      .then((result: { message?: string } | undefined) => {
        if (result?.message) setUpdateStatus(result.message);
      })
      .catch(() => setUpdateStatus("Unable to check for updates."));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-h-[60vh] sm:max-w-3xl flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Nodal workspace and preferences.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <SettingsSection title="General">
            <SettingsItem
              title="Nodal"
              description={
                <>
                  Version {version}
                  {updateStatus && (
                    <p className="mt-1 text-xs">{updateStatus}</p>
                  )}
                </>
              }
              action={
                <Button onClick={handleCheckForUpdates} variant="outline">
                  Check for updates
                </Button>
              }
              footer={
                <a
                  href={`${releasesUrl}/tag/v${version}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Read the changelog
                  <ExternalLink className="size-3" />
                </a>
              }
            />
          </SettingsSection>
          <SettingsSection title="Appearance">
            <SettingsItem
              title="Window Frame Style"
              description="Choose how the application window controls are displayed."
              action={
                <div className="flex items-center gap-2">
                  {windowFrameStyle !== savedWindowFrameStyle && (
                    <Button variant="default" onClick={handleReload}>
                      Reload
                    </Button>
                  )}
                  <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="outline">
                      {frameStyleLabels[windowFrameStyle]}
                      <ChevronDown className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    <DropdownMenuRadioGroup
                      value={windowFrameStyle}
                      onValueChange={(value) => {
                        if (
                          value === "hidden" ||
                          value === "nodal" ||
                          value === "native"
                        ) {
                          setWindowFrameStyle(value);
                        }
                      }}
                    >
                      <DropdownMenuRadioItem value="hidden">
                        Hidden
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="nodal">
                        Nodal
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="native">
                        Native
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              }
            />
          </SettingsSection>
        </div>
      </DialogContent>
    </Dialog>
  );
};
