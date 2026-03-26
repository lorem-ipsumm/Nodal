import { useAppStore } from "@/lib/hooks/store/use-app-store";
import { Folder } from "lucide-react";
import { Input } from "./ui/input";

export const Navbar = () => {
  const { activeFolder } = useAppStore();
  return (
    <section className="h-12 border-b flex items-center px-3 w-full justify-between">
      <section className="flex gap-2 items-center">
        <Folder size={18} />
        <span>{activeFolder}</span>
      </section>
      <section>
        <Input placeholder={`Search ${activeFolder}`} />
      </section>
    </section>
  );
};
