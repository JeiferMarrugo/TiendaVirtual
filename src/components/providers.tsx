"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster } from "sonner";
import { GeneralSettingsProvider } from "@/components/general-settings-provider";

function ToasterBridge() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      richColors
      position="top-right"
      closeButton
      duration={4500}
      toastOptions={{
        style: {
          borderRadius: "20px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 40px rgba(10, 10, 10, 0.12)",
          padding: "14px 18px",
          fontSize: "14px",
          fontWeight: "500",
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <GeneralSettingsProvider>
        {children}
        <ToasterBridge />
      </GeneralSettingsProvider>
    </ThemeProvider>
  );
}