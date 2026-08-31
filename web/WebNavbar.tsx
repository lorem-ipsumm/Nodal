import { useState } from "react";
import { RiGithubLine } from "@remixicon/react";
import { Button } from "../src/components/ui/button";
import logo from "../src/assets/nodal.png";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../src/components/ui/dialog";

export const WebNavbar = () => {
  const [downloadOpen, setDownloadOpen] = useState(false);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between px-0">
        <div className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
          <img src={logo} alt="" className="size-7 rounded-md" />
          <span>Nodal</span>
        </div>
        <div className="flex items-center gap-2">
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
          <Button onClick={() => setDownloadOpen(true)} size="default">
            Get Nodal
          </Button>
        </div>
      </header>

      <Dialog open={downloadOpen} onOpenChange={setDownloadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download Nodal</DialogTitle>
            <DialogDescription>
              Nodal is currently available as a desktop app for macOS, Windows,
              and Linux. Download links will be available here soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
