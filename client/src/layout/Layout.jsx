import { AnimatePresence, motion as Motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Layout = () => {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isProductSurface = location.pathname === "/app" || location.pathname === "/result";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1f1f1f]">
      <Navbar />
      <main className={`flex-1 ${isProductSurface ? "bg-[linear-gradient(180deg,#ffffff_0%,#fbfbfb_55%,#f6f6f6_100%)]" : ""}`}>
        <AnimatePresence mode="wait" initial={!prefersReducedMotion}>
          <Motion.div
            key={location.pathname}
            initial={prefersReducedMotion ? false : { opacity: 0, y: 22, filter: "blur(10px)" }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </Motion.div>
        </AnimatePresence>
      </main>
      {!isProductSurface && <Footer />}
    </div>
  );
};

export default Layout;
