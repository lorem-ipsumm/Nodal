import React from "react";
import ReactDOM from "react-dom/client";
import WebApp from "./App";
import "../src/index.css";
import ThemeProvider from "../src/components/providers/theme-provider";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { SoundProvider } from "../src/components/providers/sound-provider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SoundProvider>
        <TooltipProvider delay={500}>
          <WebApp />
        </TooltipProvider>
      </SoundProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
