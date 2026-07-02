"use client";

import { Link } from "@/i18n/routing";

interface NavPage {
  name: string;
  path: string;
  icon: string;
}

export default function NavCards({ pages }: { pages: NavPage[] }) {
  // カーソル位置をCSS変数に渡し、グローがマウスを追従するようにする
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  return (
    <nav className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
      {pages.map((page) => (
        <Link
          key={page.path}
          href={page.path}
          onMouseMove={handleMouseMove}
          className="nav-card glow-card flex items-center gap-3 rounded-xl border border-zinc-200 bg-white/85 px-4 py-4 backdrop-blur-sm dark:border-zinc-700/60 dark:bg-zinc-900/40"
        >
          <span className="text-xl">{page.icon}</span>
          <span className="font-medium">{page.name}</span>
          <span className="nav-card-arrow ml-auto text-zinc-400">→</span>
        </Link>
      ))}
    </nav>
  );
}
