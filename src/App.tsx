import "./App.css";
import { useEffect } from "react";
import { useAppStore } from "./lib/hooks/store/use-app-store";
import { Navbar } from "./components/navbar";
import { FolderToolbar } from "./components/folder-toolbar";
import { NotesContainer } from "./components/notes/notes-container";
import { NotesInput } from "./components/notes/notes-input";
import { Sidebar } from "./components/sidebar";

// App component
function App() {
  const { navbarVisible, toggleNavbar, loadPinnedNotes } = useAppStore();

  useEffect(() => {
    loadPinnedNotes();
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
    <div className="bg-background h-screen flex flex-col w-screen">
      {navbarVisible && <Navbar />}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <section className="w-full min-w-0 flex flex-col">
          <FolderToolbar />
          <NotesContainer />
          <NotesInput />
        </section>
      </div>
    </div>
  );
}

export default App;
