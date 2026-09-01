import React from "react";
import ReactDOM from "react-dom/client";
import WebApp from "./App";
import "../src/index.css";
import "./web.css";
import ThemeProvider from "../src/components/providers/theme-provider";
import { TooltipProvider } from "../src/components/ui/tooltip";
import { SoundProvider } from "../src/components/providers/sound-provider";
import { useThemeStore } from "../src/lib/hooks/store/use-theme-store";

if (!localStorage.getItem("theme-storage")) {
  useThemeStore.setState({ theme: "dark" });
}

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
