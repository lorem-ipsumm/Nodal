import { MinusIcon, SquareIcon, XIcon } from "lucide-react";
import { Label } from "./ui/label";
import Icon from "@/assets/nodal.png";
import { useAppStore } from "@/lib/hooks/store/use-app-store";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "./ui/context-menu";

export const Navbar = () => {
  const { toggleNavbar } = useAppStore();

  const handleMinimize = () => window.ipcRenderer.invoke("window-minimize");
  const handleMaximize = () => window.ipcRenderer.invoke("window-maximize");
  const handleClose = () => window.ipcRenderer.invoke("window-close");

  return (
    <ContextMenu>
      <ContextMenuTrigger
        className="h-8 flex items-center select-none shrink-0 bg-sidebar border-b"
        style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <section className="pl-2 flex items-center gap-2">
          <img src={Icon} className="w-5.5 aspect-square" />
          <Label>Nodal</Label>
        </section>
        <div
          className="ml-auto flex items-center"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            onClick={handleMinimize}
            className="h-8 w-12 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Minimize"
          >
            <MinusIcon size={12} />
          </button>
          <button
            onClick={handleMaximize}
            className="h-8 w-12 flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Maximize"
          >
            <SquareIcon size={12} />
          </button>
          <button
            onClick={handleClose}
            className="h-8 w-12 flex items-center justify-center text-muted-foreground hover:bg-red-500 hover:text-white transition-colors"
            title="Close"
          >
            <XIcon size={12} />
          </button>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={toggleNavbar}>
          Hide toolbar
          <ContextMenuShortcut>Ctrl Shift B</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
