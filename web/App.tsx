import { useEffect, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import App from "../src/App";
import { createDemoApi } from "../src/lib/api/demo-api";
import { setNodalApi } from "../src/lib/api/nodal-api";
import {
  SidebarCategory,
  useSidebarStore,
} from "../src/lib/hooks/store/use-sidebar-store";
import { WebNavbar } from "./WebNavbar";
import backgroundVideo from "../src/assets/double-flowers.mp4";


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
  const innerWindowRef = useRef<HTMLElement>(null);
  const demoRef = useRef<HTMLElement>(null);
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.7, ease: "easeOut" as const };

  // The demo has a different scroll treatment from the hero: it expands as
  // its section moves from the bottom of the inner window to the top.
  const { scrollYProgress: demoScrollProgress } = useScroll({
    container: innerWindowRef,
    target: demoRef,
    offset: ["start end", "end end"],
  });
  const smoothDemoProgress = useSpring(demoScrollProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });
  const demoScale = useTransform(
    smoothDemoProgress,
    [0, 1],
    shouldReduceMotion ? [1, 1] : [0.86, 1],
  );
  const demoY = useTransform(
    smoothDemoProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [32, 0],
  );
  const demoOpacity = useTransform(
    smoothDemoProgress,
    [0, 0.35],
    shouldReduceMotion ? [1, 1] : [0.55, 1],
  );
  const demoFrameOpacity = useTransform(
    smoothDemoProgress,
    [0, 0.75, 1],
    shouldReduceMotion ? [0, 0, 0] : [1, 0.25, 0],
  );


  useEffect(() => {
    useSidebarStore.setState({
      categories: demoCategories,
      uncategorizedFolders: [],
    });
  }, []);

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-sidebar py-3 pr-3 max-sm:px-3 max-sm:py-3">
      <WebNavbar />
      {/* inner window */}
      <section
        ref={innerWindowRef}
        className="relative h-full min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto rounded-2xl border"
      >
        <div className="pointer-events-none sticky top-0 z-0 h-0">
          <video
            className="absolute left-0 top-0 h-[calc(100vh-1.5rem)] w-full scale-105 object-cover"
            src={backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-[calc(100vh-1.5rem)] w-full bg-background/80 backdrop-blur-sm dark:bg-background/50 dark:backdrop-blur-sm" />
        </div>
        <div className="relative z-10 min-h-full">
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
              ref={demoRef}
              className="px-0 pb-24"
              aria-label="Nodal demo"
              initial={shouldReduceMotion ? false : "hidden"}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              transition={transition}
            >
              <motion.div
                className="relative rounded-2xl p-4 max-sm:rounded-xl max-sm:p-2"
                style={{
                  scale: demoScale,
                  y: demoY,
                  // Keep scroll geometry stable while the scaled visual enters
                  // the window; animating layout margins would move the bottom.
                  marginBottom: shouldReduceMotion ? 0 : "-16vh",
                  transformOrigin: "center top",
                }}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-background/50 shadow-2xl backdrop-blur-sm max-sm:rounded-xl"
                  style={{ opacity: demoFrameOpacity }}
                  aria-hidden="true"
                />
                <motion.div
                  className="relative h-[calc(100vh-3.5rem)] min-h-140 overflow-hidden rounded-xl border border-border bg-background shadow-xl max-sm:min-h-155"
                  style={{ opacity: demoOpacity }}
                >
                  <App fullHeight showNavbar={false} />
                </motion.div>
              </motion.div>
            </motion.section>
          </main>
        </div>
      </section>
    </div>
  );
}
