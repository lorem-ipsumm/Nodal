import "./App.css";
import { useEffect, useState } from "react";
import { getNodalApi } from "./lib/api/nodal-api";
import type { WindowFrameStyle } from "./lib/api/nodal-api";
import { useAppStore } from "./lib/hooks/store/use-app-store";
import { Navbar } from "./components/navbar";
import { FolderToolbar } from "./components/folder-toolbar";
import { NotesContainer } from "./components/notes/notes-container";
import { NotesInput } from "./components/notes/notes-input";
import { Sidebar } from "./components/sidebar";
import { UpdateNotification } from "./components/update-notification";

interface AppProps {
  showNavbar?: boolean;
  fullHeight?: boolean;
}

// const sampleUpdate: UpdateState | null = {
//   version: "1.3.0",
//   downloaded: false,
//   downloading: false,
//   progress: 0,
// };

// App component
export default function App({
  showNavbar = true,
  fullHeight = false,
}: AppProps) {
  const { navbarVisible, toggleNavbar, loadPinnedNotes } = useAppStore();
  const [windowFrameStyle, setWindowFrameStyle] = useState<WindowFrameStyle | null>(
    null,
  );

  useEffect(() => {
    loadPinnedNotes();
    getNodalApi()
      .getWindowFrameStyle()
      .then(setWindowFrameStyle)
      .catch(() => setWindowFrameStyle("native"));
  }, [loadPinnedNotes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleNavbar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleNavbar]);

  return (
    <div
      className={`bg-background flex flex-col ${fullHeight ? "h-full w-full" : "h-screen w-screen"}`}
    >
      {showNavbar && navbarVisible && windowFrameStyle === "nodal" && <Navbar />}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <section className="w-full min-w-0 flex flex-col">
          <FolderToolbar />
          <NotesContainer />
          <NotesInput />
        </section>
      </div>
      <UpdateNotification initialUpdate={null} />
    </div>
  );
}
