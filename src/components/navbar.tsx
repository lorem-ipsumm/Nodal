import { useAppStore } from "@/lib/hooks/store/use-app-store";

export const Navbar = () => {
  const { activeFolder } = useAppStore();
  return (
    <section className="h-12 border-b flex items-center px-3 w-full">
      <span>{activeFolder}</span>
    </section>
  );
};
