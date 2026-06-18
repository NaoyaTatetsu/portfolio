"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { NextIntlClientProvider, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import enMessages from "../../../messages/en.json";
import jaMessages from "../../../messages/ja.json";
import CameraRig, { type CameraView } from "./CameraRig";
import MacDesktop from "./MacDesktop";
import Scene from "./Scene";
import ScreenTracker, {
  DESKTOP_NATIVE_HEIGHT,
  DESKTOP_NATIVE_WIDTH,
} from "./ScreenTracker";

const BG_COLOR = "#a89884";

type SupportedLocale = "en" | "ja";
type ThemeMode = "light" | "dark";

const MESSAGES: Record<SupportedLocale, typeof enMessages> = {
  en: enMessages,
  ja: jaMessages,
};

export default function DeskExperience() {
  const initialLocale = useLocale() as SupportedLocale;
  const [currentLocale, setCurrentLocale] =
    useState<SupportedLocale>(initialLocale);
  const [view, setView] = useState<CameraView>("room");
  const [arrived, setArrived] = useState<CameraView>("room");

  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const currentTheme: ThemeMode = mounted
    ? (resolvedTheme ?? theme) === "light"
      ? "light"
      : "dark"
    : "dark";

  const innerRef = useRef<HTMLDivElement>(null);

  const handleMonitorClick = useCallback(() => {
    setView("pc");
  }, []);

  const handleExit = useCallback(() => {
    setView("room");
  }, []);

  const handleArrived = useCallback((v: CameraView) => {
    setArrived(v);
  }, []);

  const handleSwitchLocale = useCallback((locale: SupportedLocale) => {
    setCurrentLocale(locale);
    if (typeof window !== "undefined") {
      const newPath = window.location.pathname.replace(
        /^\/(en|ja)(?=\/|$)/,
        `/${locale}`,
      );
      window.history.replaceState(
        null,
        "",
        newPath + window.location.search + window.location.hash,
      );
    }
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme(currentTheme === "dark" ? "light" : "dark");
  }, [currentTheme, setTheme]);

  const desktopVisible = view === "pc" && arrived === "pc";

  return (
    <div
      className="fixed inset-0 w-screen h-screen"
      style={{ background: BG_COLOR }}
    >
      <Canvas
        camera={{ position: [-8.5, 7.8, 9], fov: 45, near: 0.1, far: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[BG_COLOR]} />
        <fog attach="fog" args={[BG_COLOR, 18, 35]} />
        <CameraRig view={view} onArrived={handleArrived} />
        <Scene view={view} onMonitorClick={handleMonitorClick} />
        <OrbitControls
          enabled={view === "room" && arrived === "room"}
          target={[0, 1.0, -1.4]}
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          minAzimuthAngle={-Math.PI / 2}
          maxAzimuthAngle={Math.PI / 10}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
        <ScreenTracker innerRef={innerRef} />
      </Canvas>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={innerRef}
          style={{
            width: `${DESKTOP_NATIVE_WIDTH}px`,
            height: `${DESKTOP_NATIVE_HEIGHT}px`,
            transformOrigin: "0 0",
            transform: "scale(0)",
            pointerEvents: desktopVisible ? "auto" : "none",
          }}
        >
          <NextIntlClientProvider
            locale={currentLocale}
            messages={MESSAGES[currentLocale]}
          >
            <MacDesktop
              active={desktopVisible}
              onExit={handleExit}
              currentLocale={currentLocale}
              onSwitchLocale={handleSwitchLocale}
              theme={currentTheme}
              onToggleTheme={handleToggleTheme}
            />
          </NextIntlClientProvider>
        </div>
      </div>

      {view === "room" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-zinc-800 text-sm bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md pointer-events-none">
          Click the monitor to zoom in
        </div>
      )}

      {desktopVisible && (
        <button
          type="button"
          onClick={handleExit}
          className="absolute bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 hover:bg-white text-zinc-800 text-sm font-medium shadow-md backdrop-blur-md transition-colors"
          aria-label="Back to room"
        >
          <span aria-hidden="true">←</span>
          <span>Back to room</span>
        </button>
      )}
    </div>
  );
}
