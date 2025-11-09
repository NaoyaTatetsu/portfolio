"use client";

import { usePathname } from "@/i18n/routing";
import { useEffect } from "react";

export default function ScrollLock() {
    const pathname = usePathname();

    useEffect(() => {
        // ホームページ（ルートパス）の場合のみスクロールを無効化
        const isHomePage = pathname === "/";

        if (isHomePage) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        // クリーンアップ
        return () => {
            document.body.style.overflow = "";
        };
    }, [pathname]);

    return null;
}

