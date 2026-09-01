import { useEffect, useState } from "react";
import {
  RiAppleLine,
  RiGithubLine,
  RiWindowsLine,
} from "@remixicon/react";
import { Button } from "../src/components/ui/button";
import logo from "../src/assets/nodal.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../src/components/ui/dialog";
import { Download } from "lucide-react";
import TuxIcon from "@/assets/TuxIcon";

type OperatingSystem = "macOS" | "Windows" | "Linux";

const getOperatingSystem = (): OperatingSystem => {
  const platform = navigator.userAgent.toLowerCase();
  if (platform.includes("mac")) return "macOS";
  if (platform.includes("win")) return "Windows";
  return "Linux";
};

const osIcons = {
  macOS: RiAppleLine,
  Windows: RiWindowsLine,
  Linux: TuxIcon,
};

export const WebNavbar = () => {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [operatingSystem] = useState<OperatingSystem>(getOperatingSystem);
  const [releaseAssets, setReleaseAssets] = useState<Record<string, string>>({});
  const OperatingSystemIcon = osIcons[operatingSystem];
  const releasesUrl = "https://github.com/lorem-ipsumm/Nodal/releases/latest";
  const releasesPageUrl = "https://github.com/lorem-ipsumm/Nodal/releases";

  useEffect(() => {
    fetch("https://api.github.com/repos/lorem-ipsumm/Nodal/releases/latest")
      .then((response) => (response.ok ? response.json() : null))
      .then((release) => {
        if (!release?.assets) return;

        const assets = release.assets as { name: string; browser_download_url: string }[];
        const matchingAssets: Record<string, string> = {};
        assets.forEach(({ name, browser_download_url }) => {
          if (name.includes("-Mac-") && name.endsWith(".dmg")) {
            matchingAssets.macOS = browser_download_url;
          }
          if (name.includes("-Windows-") && name.endsWith(".exe")) {
            matchingAssets.Windows = browser_download_url;
          }
          if (name.includes("-Linux-") && name.endsWith(".AppImage")) {
            matchingAssets.Linux = browser_download_url;
          }
        });
        setReleaseAssets(matchingAssets);
      })
      .catch(() => undefined);
  }, []);

  const getDownloadUrl = (os: OperatingSystem) =>
    releaseAssets[os] ?? releasesUrl;

  return (
    <>
      <header className="flex flex-col shrink-0 items-center justify-between px-4 h-full">
        <div className="flex flex-col items-center gap-3 text-base font-semibold tracking-tight text-foreground">
          <img src={logo} alt="Nodal logo" className="size-8 rounded-md" />
          <Button
            aria-label="Download Nodal"
            onClick={() => setDownloadOpen(true)}
            size="icon"
          >
            <Download />
          </Button>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Button
            aria-label="View Nodal on GitHub"
            render={
              <a
                href="https://github.com/lorem-ipsumm/Nodal"
                target="_blank"
                rel="noreferrer"
              />
            }
            size="icon"
            variant="ghost"
          >
            <RiGithubLine />
          </Button>
        </div>
      </header>

      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Download Nodal</DialogTitle>
            <DialogDescription>
              Download the latest version of Nodal for your device or view all
              available releases on GitHub.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <Button
              className="w-full"
              size={"lg"}
              render={
                <a
                  href={getDownloadUrl(operatingSystem)}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <OperatingSystemIcon />
              Download for {operatingSystem}
            </Button>
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                {(Object.keys(osIcons) as OperatingSystem[]).map((os) => {
                  const Icon = osIcons[os];
                  return (
                    <Button
                      key={os}
                      aria-label={`Download for ${os}`}
                      title={`Download for ${os}`}
                      variant="ghost"
                      size="icon"
                      render={
                        <a
                          href={getDownloadUrl(os)}
                          target="_blank"
                          rel="noreferrer"
                        />
                      }
                    >
                      <Icon />
                    </Button>
                  );
                })}
              </div>
              <a
                href={releasesPageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                View all releases
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
