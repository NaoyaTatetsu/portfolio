"use client";

import { useEffect, useRef } from "react";

interface InstagramPhoneProps {
  feeds: string[];
}

// 同一コンテンツを3周分並べ、スクロール位置が中央の1周分から外れたら
// 1周分だけ瞬間移動して戻す。見た目が同じ位置に飛ぶためジャンプは
// 知覚されず、無限にスクロールしているように見える
const COPIES = ["first", "second", "third"];

export default function InstagramPhone({ feeds }: InstagramPhoneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startY: number; startScrollTop: number } | null>(
    null,
  );

  const wrapScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const setHeight = el.scrollHeight / COPIES.length;
    if (setHeight === 0) return;
    let delta = 0;
    if (el.scrollTop < setHeight * 0.5) {
      delta = setHeight;
    } else if (el.scrollTop >= setHeight * 1.5) {
      delta = -setHeight;
    }
    if (delta !== 0) {
      el.scrollTop += delta;
      // ドラッグ中にジャンプすると基準位置がずれるので合わせて補正
      if (dragState.current) {
        dragState.current.startScrollTop += delta;
      }
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight / COPIES.length;
  }, []);

  // マウスのみドラッグスクロールを実装。タッチはoverflow-y-autoの
  // ネイティブスクロールに任せる(両方処理すると競合する)
  const onPointerDown = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    if (!el || e.pointerType !== "mouse") return;
    dragState.current = { startY: e.clientY, startScrollTop: el.scrollTop };
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const el = scrollRef.current;
    const drag = dragState.current;
    if (!el || !drag) return;
    el.scrollTop = drag.startScrollTop - (e.clientY - drag.startY);
  };

  const endDrag = (e: React.PointerEvent) => {
    dragState.current = null;
    const el = scrollRef.current;
    if (el?.hasPointerCapture(e.pointerId)) {
      el.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div className="relative w-[270px] h-[540px] rounded-[36px] border-8 border-zinc-900 bg-white shadow-xl dark:shadow-zinc-800/50 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-zinc-900 rounded-b-xl z-10" />
      <div
        ref={scrollRef}
        onScroll={wrapScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="h-full overflow-y-auto cursor-grab active:cursor-grabbing select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {COPIES.flatMap((copy) =>
          feeds.map((src) => (
            // biome-ignore lint/performance/noImgElement: 静的フィード画像のためnext/imageは不要
            <img
              key={`${copy}-${src}`}
              src={src}
              alt="Instagram feed"
              draggable={false}
              className="w-full pointer-events-none"
            />
          )),
        )}
      </div>
    </div>
  );
}
