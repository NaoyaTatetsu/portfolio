"use client";

import type { ReactNode } from "react";

interface MacWindowProps {
  title: string;
  icon?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function MacWindow({
  title,
  icon,
  onClose,
  children,
}: MacWindowProps) {
  return (
    <div className="w-full h-full flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-300/60 dark:border-zinc-700/60">
      <div className="flex items-center px-3 py-2 bg-zinc-100/90 dark:bg-zinc-800/90 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex gap-2 items-center">
          <button
            type="button"
            onClick={onClose}
            className="group w-3.5 h-3.5 rounded-full bg-[#ff5f57] hover:opacity-80 transition-opacity flex items-center justify-center"
            aria-label="Close"
          >
            <span className="opacity-0 group-hover:opacity-100 text-[8px] text-[#4d0000] font-bold leading-none">
              ×
            </span>
          </button>
          <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e]" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 -ml-12">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-white dark:bg-zinc-950">
        {children}
      </div>
    </div>
  );
}
