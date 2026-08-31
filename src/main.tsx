import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import ThemeProvider from "./components/providers/theme-provider.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { SoundProvider } from "./components/providers/sound-provider.tsx";
import { createElectronApi, setNodalApi } from "./lib/api/nodal-api";

setNodalApi(createElectronApi(window.ipcRenderer));

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

