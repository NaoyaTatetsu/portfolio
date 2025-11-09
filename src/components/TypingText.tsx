"use client";

import { useEffect, useState, useRef } from "react";

interface TypingTextProps {
  texts?: string[];
  prefix?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseAfterTyping?: number;
  pauseAfterDeleting?: number;
}

export default function TypingText({
  texts = [" Naoya Tatetsu.", " System Engineer."],
  prefix = "I'm",
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseAfterTyping = 1500,
  pauseAfterDeleting = 500,
}: TypingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const currentTextIndexRef = useRef(0);
  const isTypingRef = useRef(true);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (texts.length === 0) return;

    let timeoutId: NodeJS.Timeout;

    const animate = () => {
      const currentText = texts[currentTextIndexRef.current];
      const currentIndex = currentIndexRef.current;
      const isTyping = isTypingRef.current;

      if (isTyping) {
        // タイピング中
        if (currentIndex <= currentText.length) {
          setDisplayedText(currentText.slice(0, currentIndex));
          currentIndexRef.current++;
          timeoutId = setTimeout(animate, typingSpeed);
        } else {
          // タイピング完了後、少し待ってから削除開始
          currentIndexRef.current = currentText.length;
          timeoutId = setTimeout(() => {
            isTypingRef.current = false;
            animate();
          }, pauseAfterTyping);
        }
      } else {
        // 削除中
        if (currentIndex > 0) {
          setDisplayedText(currentText.slice(0, currentIndex - 1));
          currentIndexRef.current--;
          timeoutId = setTimeout(animate, deletingSpeed);
        } else {
          // 削除完了後、次のテキストに移動
          currentIndexRef.current = 0;
          currentTextIndexRef.current = (currentTextIndexRef.current + 1) % texts.length;
          timeoutId = setTimeout(() => {
            isTypingRef.current = true;
            animate();
          }, pauseAfterDeleting);
        }
      }
    };

    animate();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [texts, typingSpeed, deletingSpeed, pauseAfterTyping, pauseAfterDeleting]);

  return (
    <h2 className="text-xl font-semibold mb-8">
      {prefix}
      <span>{displayedText}</span>
      <span className="animate-pulse">|</span>
    </h2>
  );
}

