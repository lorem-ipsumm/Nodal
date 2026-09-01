import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import App from "../src/App";
import { createDemoApi } from "../src/lib/api/demo-api";
import { setNodalApi } from "../src/lib/api/nodal-api";
import {
  SidebarCategory,
  useSidebarStore,
} from "../src/lib/hooks/store/use-sidebar-store";
import { WebNavbar } from "./WebNavbar";
import backgroundVideo from "../src/assets/double-flowers.mp4";
import { FolderTree, NotebookPen, Search } from "lucide-react";

setNodalApi(createDemoApi());

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

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
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: "easeOut" as const };

  useEffect(() => {
    useSidebarStore.setState({
      categories: demoCategories,
      uncategorizedFolders: [],
    });
  }, []);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-sidebar py-3 pr-3 max-sm:px-3 max-sm:py-3">
      <WebNavbar />
      <section className="relative h-full min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto rounded-2xl border">
        <div className="relative min-h-full">
          <video
            className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover"
            src={backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm dark:bg-background/50 dark:backdrop-blur-sm" />
          <main className="relative min-h-full">
            <motion.section
              className="flex min-h-[48vh] flex-col justify-center px-12 py-16 max-lg:px-8 max-sm:min-h-[46vh] max-sm:px-5 max-sm:py-12"
              initial={shouldReduceMotion ? false : "hidden"}
              animate="visible"
              variants={staggerChildren}
            >
              <motion.h1
                className="max-w-3xl text-5xl font-semibold tracking-tight text-foreground max-lg:text-4xl max-sm:text-3xl"
                variants={fadeUp}
                transition={transition}
              >
                Keep your thoughts close and your workspace clean.
              </motion.h1>
              <motion.p
                className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground max-sm:text-base max-sm:leading-7"
                variants={fadeUp}
                transition={{
                  ...transition,
                  delay: shouldReduceMotion ? 0 : 0.1,
                }}
              >
                Nodal is a simple, focused place to capture ideas, organize
                notes, and return to the things that matter.
              </motion.p>
            </motion.section>

            <motion.section
              className="px-8 pb-24 max-lg:px-5 max-sm:px-0"
              aria-label="Nodal demo"
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              transition={transition}
            >
              <div className="rounded-2xl bg-background/50 p-4 shadow-2xl backdrop-blur-sm max-sm:rounded-xl max-sm:p-2">
                <div className="h-[min(82vh,720px)] min-h-[560px] overflow-hidden rounded-xl border border-border bg-background shadow-xl max-sm:min-h-[620px]">
                  <App fullHeight showNavbar={false} />
                </div>
              </div>
            </motion.section>

            <motion.section
              className="px-12 pb-28 max-lg:px-8 max-sm:px-4"
              aria-labelledby="features-heading"
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={staggerChildren}
            >
              <motion.div className="mb-10 max-w-xl" variants={staggerChildren}>
                <motion.p
                  className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-primary"
                  variants={fadeUp}
                  transition={transition}
                >
                  Built for focus
                </motion.p>
                <motion.h2
                  id="features-heading"
                  className="text-3xl font-semibold tracking-tight text-foreground"
                  variants={fadeUp}
                  transition={transition}
                >
                  Everything you need to think clearly.
                </motion.h2>
                <motion.p
                  className="mt-4 leading-7 text-muted-foreground"
                  variants={fadeUp}
                  transition={transition}
                >
                  A lightweight workspace that keeps organization useful and out
                  of the way.
                </motion.p>
              </motion.div>
              <motion.div
                className="grid gap-4 md:grid-cols-3"
                variants={staggerChildren}
              >
                <motion.article
                  className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm"
                  variants={fadeUp}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                  transition={transition}
                >
                  <NotebookPen className="mb-5 size-5 text-primary" />
                  <h3 className="font-medium text-card-foreground">
                    Capture quickly
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Write ideas down without breaking your flow. Markdown keeps
                    notes simple and flexible.
                  </p>
                </motion.article>
                <motion.article
                  className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm"
                  variants={fadeUp}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                  transition={transition}
                >
                  <FolderTree className="mb-5 size-5 text-primary" />
                  <h3 className="font-medium text-card-foreground">
                    Organize naturally
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Group notes into folders and categories that match the way
                    your projects actually work.
                  </p>
                </motion.article>
                <motion.article
                  className="rounded-xl border border-border bg-card/80 p-6 backdrop-blur-sm"
                  variants={fadeUp}
                  whileHover={shouldReduceMotion ? undefined : { y: -6 }}
                  transition={transition}
                >
                  <Search className="mb-5 size-5 text-primary" />
                  <h3 className="font-medium text-card-foreground">
                    Find your way back
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Keep your workspace approachable so useful thoughts are easy
                    to revisit when you need them.
                  </p>
                </motion.article>
              </motion.div>
            </motion.section>
          </main>
        </div>
      </section>
    </div>
  );
}
