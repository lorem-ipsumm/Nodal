import { useEffect, type ReactNode } from "react";
import { bind } from "cuelume";
import { setEnabled } from "cuelume";
import { useAppStore } from "@/lib/hooks/store/use-app-store";

export const SoundProvider = ({ children }: { children: ReactNode }) => {
  const { soundsEnabled } = useAppStore();

  setEnabled(soundsEnabled);

  useEffect(() => {
    bind();
  }, []);

  return children;
};
