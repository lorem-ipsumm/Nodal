import { useThemeStore } from "@/lib/hooks/store/use-theme-store";
import { useEffect } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Check for system preference on initial load
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme-storage");
      if (
        !savedTheme &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        setTheme("dark");
      }
    }
  }, [setTheme]);

  useEffect(() => {
    // Apply theme to document
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
