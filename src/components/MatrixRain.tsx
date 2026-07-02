"use client";

import { useEffect, useRef } from "react";

const CHARS =
  "アァカサタナハマヤラワガザダバパイキシチニヒミリギジビピウクスツヌフムユルグズヅブプ0123456789";

export default function MatrixRain({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const fontSize = 14;
    const columns = Math.max(1, Math.floor(canvas.width / fontSize));
    const drops = Array.from({ length: columns }, () =>
      Math.floor(Math.random() * -30),
    );

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const draw = () => {
      // 残像を残しつつ少しずつ黒でフェードさせる
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = Math.random() > 0.95 ? "#d1fae5" : "#22c55e";
        ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw();
      return;
    }

    const id = setInterval(draw, 50);
    return () => clearInterval(id);
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
