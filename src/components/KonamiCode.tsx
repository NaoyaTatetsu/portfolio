"use client";

import { useEffect, useRef, useState } from "react";
import MatrixRain from "@/components/MatrixRain";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function KonamiCode() {
  const [active, setActive] = useState(false);
  const positionRef = useRef(0);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === SEQUENCE[positionRef.current]) {
        positionRef.current++;
        if (positionRef.current === SEQUENCE.length) {
          positionRef.current = 0;
          setActive(true);
        }
      } else {
        positionRef.current = key === SEQUENCE[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!active) return;
    const timeoutId = setTimeout(() => setActive(false), 8000);
    return () => clearTimeout(timeoutId);
  }, [active]);

  if (!active) return null;

  return (
    <button
      type="button"
      className="fixed inset-0 z-100 cursor-pointer bg-black"
      onClick={() => setActive(false)}
      aria-label="Close easter egg"
    >
      <MatrixRain className="absolute inset-0 h-full w-full" />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="animate-pulse px-4 text-center font-mono text-2xl font-bold text-emerald-400 drop-shadow-[0_0_12px_#22c55e]">
          🎮 KONAMI CODE ACTIVATED
        </span>
      </span>
    </button>
  );
}
