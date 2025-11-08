"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Footer() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-50 dark:border-t dark:border-zinc-800 dark:bg-zinc-900/80 dark:backdrop-blur-sm"
      style={{
        backgroundColor: mounted && theme === "light" ? "#ffffff" : undefined,
        borderTop: mounted && theme === "light" ? "none" : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className="text-center text-sm dark:text-zinc-400"
          style={{
            color: mounted && theme === "light" ? "#000000" : undefined,
          }}
        >
          ©2025 Naoya Tatetsu
        </div>
      </div>
    </footer>
  );
}

