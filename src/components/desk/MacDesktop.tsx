"use client";

import { useEffect, useState } from "react";
import BlogScreen from "@/components/screens/BlogScreen";
import ContactScreen from "@/components/screens/ContactScreen";
import ExperienceScreen from "@/components/screens/ExperienceScreen";
import NewsScreen from "@/components/screens/NewsScreen";
import ProfileScreen from "@/components/screens/ProfileScreen";
import { routing } from "@/i18n/routing";
import MacWindow from "./MacWindow";

type SupportedLocale = "en" | "ja";
type ThemeMode = "light" | "dark";

type AppId = "profile" | "news" | "blog" | "experience" | "contact";

interface AppDef {
  id: AppId;
  label: string;
  icon: string;
  render: () => React.ReactNode;
}

const APPS: AppDef[] = [
  {
    id: "profile",
    label: "Profile",
    icon: "👤",
    render: () => <ProfileScreen />,
  },
  { id: "news", label: "News", icon: "📰", render: () => <NewsScreen /> },
  { id: "blog", label: "Blog", icon: "📝", render: () => <BlogScreen /> },
  {
    id: "experience",
    label: "Experience",
    icon: "🏢",
    render: () => <ExperienceScreen />,
  },
  {
    id: "contact",
    label: "Contact",
    icon: "📧",
    render: () => <ContactScreen />,
  },
];

interface MacDesktopProps {
  active: boolean;
  onExit: () => void;
  currentLocale: SupportedLocale;
  onSwitchLocale: (locale: SupportedLocale) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

function useClock() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hh = now.getHours().toString().padStart(2, "0");
      const mm = now.getMinutes().toString().padStart(2, "0");
      setTime(`${hh}:${mm}`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function MacDesktop({
  active,
  onExit,
  currentLocale,
  onSwitchLocale,
  theme,
  onToggleTheme,
}: MacDesktopProps) {
  const [openApp, setOpenApp] = useState<AppId | null>(null);
  const time = useClock();

  const openedApp = openApp ? APPS.find((a) => a.id === openApp) : null;
  const isDark = theme === "dark";
  const wallpaper = isDark
    ? "linear-gradient(135deg, #1e3a8a 0%, #6d28d9 50%, #db2777 100%)"
    : "linear-gradient(135deg, #93c5fd 0%, #f0abfc 50%, #fde68a 100%)";

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none ${isDark ? "dark" : ""}`}
      style={{
        backgroundImage: wallpaper,
        pointerEvents: active ? "auto" : "none",
      }}
    >
      <div className="absolute top-0 inset-x-0 h-7 px-3 flex items-center gap-3 text-white text-xs bg-black/30 backdrop-blur-md z-30">
        <button
          type="button"
          onClick={onExit}
          className="flex items-center hover:opacity-70 transition-opacity"
          aria-label="Back to room"
          title="Back to room"
        >
          <span className="text-sm leading-none"></span>
        </button>
        <span className="font-semibold">
          {openedApp ? openedApp.label : "Finder"}
        </span>
        <span className="opacity-80">File</span>
        <span className="opacity-80">Edit</span>
        <span className="opacity-80">View</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onToggleTheme}
          className="hover:opacity-70 transition-opacity"
          aria-label="Toggle theme"
        >
          {isDark ? "🌙" : "☀️"}
        </button>
        <div className="flex gap-1">
          {routing.locales.map((locale) => (
            <button
              type="button"
              key={locale}
              onClick={() => onSwitchLocale(locale as SupportedLocale)}
              className={`px-1.5 rounded ${
                currentLocale === locale ? "bg-white/25" : "hover:bg-white/15"
              }`}
            >
              {locale === "en" ? "🇺🇸" : "🇯🇵"}
            </button>
          ))}
        </div>
        <span className="font-mono">{time || "--:--"}</span>
      </div>

      <div className="absolute right-6 top-12 flex flex-col gap-5 z-10">
        {APPS.map((app) => (
          <button
            type="button"
            key={app.id}
            onClick={() => setOpenApp(app.id)}
            className="flex flex-col items-center gap-1 group focus:outline-none"
          >
            <div className="w-14 h-14 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-3xl group-hover:bg-white/30 group-focus:bg-white/35 transition-colors">
              {app.icon}
            </div>
            <div className="text-white text-xs font-medium drop-shadow-md px-1 rounded group-focus:bg-blue-500/80">
              {app.label}
            </div>
          </button>
        ))}
      </div>

      {openedApp && (
        <div className="absolute inset-7 z-20 flex items-center justify-center">
          <div className="w-[88%] h-[88%]">
            <MacWindow
              title={openedApp.label}
              icon={openedApp.icon}
              onClose={() => setOpenApp(null)}
            >
              {openedApp.render()}
            </MacWindow>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 inset-x-0 flex justify-center z-10">
        <div className="flex items-end gap-2 px-4 py-2 rounded-2xl bg-white/15 backdrop-blur-lg border border-white/20">
          {APPS.map((app) => (
            <button
              type="button"
              key={app.id}
              onClick={() => setOpenApp(app.id)}
              className="w-12 h-12 rounded-xl bg-white/30 hover:scale-110 hover:-translate-y-1 transition-transform flex items-center justify-center text-2xl"
              aria-label={app.label}
              title={app.label}
            >
              {app.icon}
            </button>
          ))}
          <div className="w-px h-10 bg-white/30 mx-1" />
          <button
            type="button"
            onClick={onExit}
            className="w-12 h-12 rounded-xl bg-white/30 hover:scale-110 hover:-translate-y-1 transition-transform flex items-center justify-center text-2xl"
            aria-label="Back to room"
            title="Back to room"
          >
            🚪
          </button>
        </div>
      </div>
    </div>
  );
}
