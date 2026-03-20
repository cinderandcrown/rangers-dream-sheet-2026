import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";


const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function Layout({ children }) {
  const location = useLocation();
  useEffect(() => {
    document.title = "Rangers Dream Sheet 2026";
  }, []);

  return (
    <div
      className="dark app-shell-bg min-h-screen text-white"
      style={{
        background: "#0A1628",
        color: "#E2E8F0",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
        paddingLeft: "env(safe-area-inset-left, 0px)",
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${location.pathname}${location.search}`}
            custom={transitionType}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}