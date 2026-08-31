import { useEffect } from "react";
import App from "../src/App";
import { createDemoApi } from "../src/lib/api/demo-api";
import { setNodalApi } from "../src/lib/api/nodal-api";
import {
  SidebarCategory,
  useSidebarStore,
} from "../src/lib/hooks/store/use-sidebar-store";
import { WebNavbar } from "./WebNavbar";
import backgroundImage from "../src/assets/background.jpg";

setNodalApi(createDemoApi());

const demoCategories: SidebarCategory[] = [
  {
    id: "main",
    name: "main",
    collapsed: false,
    folderNames: ["weclome", "features"],
  },
  {
    id: "misc",
    name: "misc",
    collapsed: false,
    folderNames: ["reading list", "ideas"],
  },
  { id: "archive", name: "archive", collapsed: false, folderNames: [] },
];

export default function WebApp() {
  useEffect(() => {
    useSidebarStore.setState({
      categories: demoCategories,
      uncategorizedFolders: [],
    });
  }, []);

  return (
    <div
      className="relative h-screen w-screen overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      <div className="relative mx-auto flex h-full w-full max-w-[90vw] flex-col px-6 pb-6 max-sm:px-3 max-sm:py-3">
        <WebNavbar />
        <section className="mt-3 h-full min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <App fullHeight showNavbar={false} />
        </section>
      </div>
    </div>
  );
}
