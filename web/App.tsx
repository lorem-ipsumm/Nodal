import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import App from "../src/App";
import { createDemoApi } from "../src/lib/api/demo-api";
import { setNodalApi } from "../src/lib/api/nodal-api";
import { useAppStore } from "../src/lib/hooks/store/use-app-store";
import { WebNavbar } from "./WebNavbar";
import backgroundVideo from "../src/assets/double-flowers.mp4";
import backgroundFallback from "../src/assets/flowers.jpg";

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


export default function WebApp() {
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    useAppStore.setState({ activeFolder: "welcome" });
  }, []);
  const [isBackgroundVideoLoaded, setIsBackgroundVideoLoaded] = useState(false);
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
  const { scrollYProgress: innerScrollProgress } = useScroll({
    container: innerWindowRef,
  });
  // Keep the visual transition synchronized with the scroll position. A spring
  // here would continue resizing after the container reaches its scroll limit,
  // making it appear as though another scroll is still available.
  const demoScale = useTransform(
    demoScrollProgress,
    [0, 1],
    shouldReduceMotion ? [1, 1] : [0.86, 1],
  );
  const demoY = useTransform(
    demoScrollProgress,
    [0, 1],
    shouldReduceMotion ? [0, 0] : [32, 0],
  );
  const demoFrameOpacity = useTransform(
    innerScrollProgress,
    [0, 0.65, 1],
    shouldReduceMotion ? [0, 0, 0] : [1, 0.25, 0],
  );
  const backgroundOverlayOpacity = useTransform(
    innerScrollProgress,
    [0, 0.8, 1],
    [1, 0.25, 0],
  );
  const backgroundOverlayBlur = useTransform(
    innerScrollProgress,
    [0, 0.5, 1],
    ["blur(10px)", "blur(5px)", "blur(0px)"],
  );

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-sidebar py-3 pr-3 max-sm:px-3 max-sm:py-3">
      <WebNavbar />
      {/* inner window */}
      <section
        ref={innerWindowRef}
        className="relative h-full min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto rounded-2xl border web-demo"
      >
        <div className="pointer-events-none sticky top-0 z-0 h-0">
          {!isBackgroundVideoLoaded && (
            <img
              className="absolute left-0 top-0 h-[calc(100vh-1.5rem)] w-full scale-105 object-cover max-sm:blur-sm"
              src={backgroundFallback}
              alt=""
              aria-hidden="true"
            />
          )}
          <video
            className="absolute left-0 top-0 h-[calc(100vh-1.5rem)] w-full scale-105 object-cover max-sm:blur-sm"
            src={backgroundVideo}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setIsBackgroundVideoLoaded(true)}
            aria-hidden="true"
          />
          <motion.div
            className="absolute left-0 top-0 h-[calc(100vh-1.5rem)] w-full bg-background/80 dark:bg-background/50"
            style={{
              opacity: backgroundOverlayOpacity,
              backdropFilter: backgroundOverlayBlur,
            }}
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 min-h-full max-sm:pt-5">
          <main className="relative min-h-full">
            <motion.section
              className="flex min-h-[48vh] flex-col justify-center px-12 md:py-16 max-lg:px-8  max-sm:px-5 max-sm:pt-12"
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
              className="px-0 pb-24 max-sm:hidden"
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
                  className="pointer-events-none absolute inset-0 z-0 rounded-2xl bg-background/50 shadow-2xl backdrop-blur-sm max-sm:rounded-xl"
                  style={{ opacity: demoFrameOpacity }}
                  aria-hidden="true"
                />
                <motion.div className="relative z-10 h-[calc(100vh-3.5rem)] min-h-140 overflow-hidden rounded-xl border border-border bg-background shadow-xl max-sm:min-h-155">
                  <App fullHeight showNavbar={false} />
                </motion.div>
              </motion.div>
            </motion.section>

            <section
              className="hidden px-5 pb-16 max-sm:flex max-sm:flex-col max-sm:justify-center"
              aria-label="Nodal mobile demo"
            >
              <div className="overflow-hidden rounded-xl border border-border bg-background/50 shadow-xl backdrop-blur-sm">
                <video
                  className="block h-auto w-full"
                  src="/nodal-demo.webm"
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  preload="metadata"
                  aria-label="Nodal app demo"
                />
              </div>
              <span className="text-sm text-center block mt-2">For a full demo, please visit the site on desktop</span>
            </section>
          </main>
        </div>
      </section>
    </div>
  );
}
