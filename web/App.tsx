import { useEffect } from "react";
import App from "../src/App";
import { createDemoApi } from "../src/lib/api/demo-api";
import { setNodalApi } from "../src/lib/api/nodal-api";
import {
  SidebarCategory,
  useSidebarStore,
} from "../src/lib/hooks/store/use-sidebar-store";
import { WebNavbar } from "./WebNavbar";
import backgroundImage from "../src/assets/background-dithered.jpg";

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
    <div className="relative mx-auto flex w-full pr-3 py-3 max-sm:px-3 max-sm:py-3 h-screen">
      <WebNavbar />
      <section
        className="h-full min-h-0 flex-1 overflow-hidden bg-background p-10 rounded-2xl bg-cover"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/*<div className="absolute inset-0 bg-background/70 backdrop-blur-sm " />*/}
        <div className="w-full h-full rounded-xl overflow-hidden border shadow-2xl z-[10]">
          <App fullHeight showNavbar={false} />
        </div>
      </section>
    </div>
  );
}
