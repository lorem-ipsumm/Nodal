import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ThemeProvider from "./components/providers/theme-provider.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { SoundProvider } from "./components/providers/sound-provider.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SoundProvider>
        <TooltipProvider delay={500}>
          <App />
        </TooltipProvider>
      </SoundProvider>
    </ThemeProvider>
  </React.StrictMode>,
);

// Use contextBridge
window.ipcRenderer.on("main-process-message", (_event, message) => {
  console.log(message);
});
