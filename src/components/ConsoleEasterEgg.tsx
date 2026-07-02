"use client";

import { useEffect } from "react";

export default function ConsoleEasterEgg() {
  useEffect(() => {
    console.log(
      `%c
 _   _                         _____     _       _
| \\ | | __ _  ___  _   _  __ _|_   _|_ _| |_ ___| |_ ___ _   _
|  \\| |/ _\` |/ _ \\| | | |/ _\` | | |/ _\` | __/ _ \\ __/ __| | | |
| |\\  | (_| | (_) | |_| | (_| | | | (_| | ||  __/ |_\\__ \\ |_| |
|_| \\_|\\__,_|\\___/ \\__, |\\__,_| |_|\\__,_|\\__\\___|\\__|___/\\__,_|
                   |___/
`,
      "color: #22d3ee; font-family: monospace;",
    );
    console.log(
      "%c👋 hello, fellow engineer!",
      "color: #f0f; font-size: 14px; font-weight: bold;",
    );
    console.log(
      "%cSource: https://github.com/NaoyaTatetsu",
      "color: #a1a1aa; font-size: 12px;",
    );
    console.log(
      "%chints: the terminal has undocumented commands. and… ↑↑↓↓←→←→BA",
      "color: #22c55e; font-size: 12px;",
    );
  }, []);

  return null;
}
