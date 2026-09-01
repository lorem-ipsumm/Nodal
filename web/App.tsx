import { useEffect } from "react";
import App from "../src/App";
import { createDemoApi } from "../src/lib/api/demo-api";
import { setNodalApi } from "../src/lib/api/nodal-api";
import {
  SidebarCategory,
  useSidebarStore,
} from "../src/lib/hooks/store/use-sidebar-store";
import { WebNavbar } from "./WebNavbar";
import backgroundImage from "../src/assets/mountain.jpg";
import { FolderTree, NotebookPen, Search } from "lucide-react";

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
      className="relative flex h-screen w-full overflow-hidden pr-3 py-3 max-sm:px-3 max-sm:py-3 bg-sidebar"
    >
      <WebNavbar />
      <section className="relative h-full min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden rounded-2xl border">
        <div
          className="relative min-h-full  bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm dark:backdrop-blur-lg" />
          <main className="relative min-h-full">
          <section className="flex min-h-[48vh] flex-col justify-center px-12 py-16 max-lg:px-8 max-sm:min-h-[46vh] max-sm:px-5 max-sm:py-12">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-primary">
              A calmer workspace
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-foreground max-lg:text-4xl max-sm:text-3xl">
              Keep your thoughts close and your workspace quiet.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground max-sm:text-base max-sm:leading-7">
              Nodal is a simple, focused place to capture ideas, organize notes,
              and return to the things that matter.
            </p>
          </section>

          <section className="px-8 pb-24 max-lg:px-5 max-sm:px-0" aria-label="Nodal demo">
            <div className="rounded-2xl bg-transparent p-4 shadow-2xl backdrop-blur-sm max-sm:rounded-xl max-sm:p-2">
              <div className="h-[min(72vh,720px)] min-h-[560px] overflow-hidden rounded-xl border border-border bg-background shadow-xl max-sm:min-h-[620px]">
                <App fullHeight showNavbar={false} />
              </div>
            </div>
          </section>

          <section className="px-12 pb-28 max-lg:px-8 max-sm:px-4" aria-labelledby="features-heading">
            <div className="mb-10 max-w-xl">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Built for focus
              </p>
              <h2 id="features-heading" className="text-3xl font-semibold tracking-tight text-foreground">
                Everything you need to think clearly.
              </h2>
              <p className="mt-4 leading-7 text-muted-foreground">
                A lightweight workspace that keeps organization useful and out
                of the way.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
                <NotebookPen className="mb-5 size-5 text-primary" />
                <h3 className="font-medium text-card-foreground">Capture quickly</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Write ideas down without breaking your flow. Markdown keeps
                  notes simple and flexible.
                </p>
              </article>
              <article className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
                <FolderTree className="mb-5 size-5 text-primary" />
                <h3 className="font-medium text-card-foreground">Organize naturally</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Group notes into folders and categories that match the way
                  your projects actually work.
                </p>
              </article>
              <article className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm">
                <Search className="mb-5 size-5 text-primary" />
                <h3 className="font-medium text-card-foreground">Find your way back</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Keep your workspace approachable so useful thoughts are easy
                  to revisit when you need them.
                </p>
              </article>
            </div>
          </section>
          </main>
        </div>
      </section>
    </div>
  );
}
