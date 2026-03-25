"use client";

import { AnimatePresence, motion } from "framer-motion";

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export function LoadingOverlay({ visible, message = "Procesando..." }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="glass-panel flex flex-col items-center gap-5 rounded-[32px] px-12 py-9"
          >
            <div className="relative h-11 w-11">
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-line border-t-accent" />
              <div
                className="absolute inset-[3px] animate-spin rounded-full border border-accent/30"
                style={{ animationDuration: "2s", animationDirection: "reverse" }}
              />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{message}</p>
              <p className="text-muted mt-1 text-sm">Un momento por favor</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
