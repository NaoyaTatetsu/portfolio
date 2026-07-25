"use client";

import { useEffect } from "react";

// ルートレイアウトは言語切り替えで再レンダリングされないため、
// <html lang> をクライアント側で locale に同期する
export function DocumentLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
