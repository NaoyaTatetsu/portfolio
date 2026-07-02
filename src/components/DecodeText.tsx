"use client";

import { useEffect, useState } from "react";

const GLYPHS = "!<>-_\\/[]{}=+*^?#ABCDEF0123456789";

/** 暗号解読風に文字がスクランブルから確定していく演出 */
export default function DecodeText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  // SSR・JS無効時はそのままテキストを表示する
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const framesPerChar = 3;
    let frame = 0;
    const intervalId = setInterval(() => {
      frame++;
      const revealed = Math.floor(frame / framesPerChar);
      setDisplay(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " " || i < revealed) return ch;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (revealed >= text.length) clearInterval(intervalId);
    }, 40);

    return () => clearInterval(intervalId);
  }, [text]);

  return <span className={className}>{display}</span>;
}
