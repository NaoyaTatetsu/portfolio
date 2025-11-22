"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

const MIN_LOADING_TIME = 200; // 最小表示時間（ミリ秒）

export default function Loading() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 最小表示時間を設定して、短すぎるローディングを防ぐ
    const timer = setTimeout(() => {
      setShow(true);
    }, MIN_LOADING_TIME);

    return () => clearTimeout(timer);
  }, []);

  if (!show) {
    return null;
  }

  return (
    <div className="flex w-full max-w-3xl flex-col items-center justify-center px-16 font-sans mt-8 mb-8">
      <LoadingSpinner size={120} />
    </div>
  );
}
