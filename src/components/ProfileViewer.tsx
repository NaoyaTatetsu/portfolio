"use client";

import Image from "next/image";
import { useState } from "react";
import PlanetScene from "./PlanetScene";

type Mode = "animation" | "normal";

interface ProfileItem {
  title: string;
  description: string;
}

interface ProfileViewerProps {
  items: ProfileItem[];
}

interface ModeToggleProps {
  mode: Mode;
  onChange: (m: Mode) => void;
}

function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const baseBtn =
    "font-display font-semibold text-xs md:text-sm px-3 md:px-4 py-1.5 rounded-md border-2 border-zinc-900 dark:border-zinc-50 transition-all";
  const active =
    "bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 shadow-[2px_2px_0_0_rgba(0,0,0,0.85)] dark:shadow-[2px_2px_0_0_rgba(255,255,255,0.7)]";
  const inactive =
    "bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 hover:bg-white";

  return (
    <div
      role="tablist"
      aria-label="表示モード切り替え"
      className="inline-flex items-center gap-1.5 p-1 rounded-lg border-2 border-zinc-900 dark:border-zinc-50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm shadow-[3px_3px_0_0_rgba(0,0,0,0.85)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.7)]"
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "normal"}
        onClick={() => onChange("normal")}
        className={`${baseBtn} ${mode === "normal" ? active : inactive}`}
      >
        📋 普通
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "animation"}
        onClick={() => onChange("animation")}
        className={`${baseBtn} ${mode === "animation" ? active : inactive}`}
      >
        🌍 ワールド
      </button>
    </div>
  );
}

function NormalView({ items }: { items: ProfileItem[] }) {
  return (
    <div className="flex flex-col items-center gap-6 md:gap-8 w-full pt-2 pb-10">
      <Image
        src="/me_in_cafe.svg"
        alt="Me in cafe"
        width={320}
        height={320}
        priority
        className="rounded-full w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 shadow-lg dark:shadow-xl dark:shadow-zinc-800/50"
      />
      <div className="space-y-4 text-left max-w-md w-full px-4">
        {items.map((item) => (
          <div key={item.title} className="flex flex-col">
            <span className="font-display font-semibold break-words">
              {item.title}
            </span>
            <span className="text-sm text-zinc-700 dark:text-zinc-300 break-words">
              {item.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfileViewer({ items }: ProfileViewerProps) {
  const [mode, setMode] = useState<Mode>("normal");

  return (
    <div className="flex flex-col items-center gap-4 md:gap-5 w-full">
      <ModeToggle mode={mode} onChange={setMode} />

      {mode === "animation" ? (
        <>
          <p className="text-xs md:text-sm text-zinc-700 dark:text-zinc-300 text-center -mt-1">
            人を歩かせて、惑星に散らばった情報を集めよう
          </p>
          <div className="relative w-full max-w-[820px] aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden border-2 border-zinc-900 dark:border-zinc-50 shadow-[5px_5px_0_0_rgba(0,0,0,0.85)] dark:shadow-[5px_5px_0_0_rgba(255,255,255,0.7)]">
            <PlanetScene items={items} />
          </div>
        </>
      ) : (
        <NormalView items={items} />
      )}
    </div>
  );
}
