import "./App.css";
import { Navbar } from "./components/navbar";
import { NotesContainer } from "./components/notes/notes-container";
import { NotesInput } from "./components/notes/notes-input";
import { Sidebar } from "./components/sidebar";

// App component
function App() {
  return (
    <div className="bg-background h-screen flex w-screen">
      <Sidebar />
      <section className="w-full flex flex-col">
        <Navbar />
        <NotesContainer />
        <NotesInput />
      </section>
    </div>
  );
}

export default App;
