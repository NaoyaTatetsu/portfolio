"use client";

import { useRef } from "react";

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  /** 要素の端にカーソルがあるときの最大の傾き（度） */
  maxTilt?: number;
  /** ホバー中の拡大率 */
  hoverScale?: number;
}

// cloudflare.pay のカードのようなホバーエフェクトの汎用ラッパー。
// カーソル位置へ向かって 3D で傾き、離れるとバネっぽく元に戻る
export default function Tilt({
  children,
  className,
  maxTilt = 14,
  hoverScale = 1.06,
}: TiltProps) {
  const tiltRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // 中心を原点(-0.5〜0.5)としたカーソル位置
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transition = "transform 0.1s ease-out";
    el.style.transform = `rotateX(${(-py * 2 * maxTilt).toFixed(2)}deg) rotateY(${(px * 2 * maxTilt).toFixed(2)}deg) scale(${hoverScale})`;
  };

  const handleMouseLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transition = "transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: マウス追従の装飾効果のみで操作機能はなく、キーボード対応は不要
    <div
      className={className}
      style={{ perspective: "1300px" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={tiltRef} style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
