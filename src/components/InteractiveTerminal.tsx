"use client";

import { useEffect, useRef, useState } from "react";
import MatrixRain from "@/components/MatrixRain";
import {
  type FsNode,
  formatCwd,
  getNode,
  resolvePath,
} from "@/lib/terminal-fs";

interface InteractiveTerminalProps {
  fs: FsNode;
  welcome: string;
  hint: string;
}

type HistoryEntry =
  | { kind: "cmd"; cwd: string; text: string }
  | { kind: "text"; text: string }
  | { kind: "error"; text: string }
  | { kind: "ls"; entries: { name: string; isDir: boolean }[] }
  | { kind: "neofetch" }
  | { kind: "sl" };

const COMMANDS = [
  "ls",
  "cd",
  "cat",
  "pwd",
  "tree",
  "whoami",
  "clear",
  "help",
  "echo",
  "date",
  "history",
  "neofetch",
  "cowsay",
];

const HELP_TEXT = [
  "Available commands:",
  "  ls [-a] [path]   list directory contents",
  "  cd <path>        change directory",
  "  cat <file>       print file contents",
  "  pwd              print working directory",
  "  tree [path]      list contents in a tree-like format",
  "  whoami           print who I am",
  "  echo <text>      display a line of text",
  "  date             print the current date and time",
  "  history          show command history",
  "  neofetch         show system information",
  "  cowsay <text>    a cow says things",
  "  clear            clear the terminal screen",
  "  help             show this help",
  "",
  "...and a few undocumented ones. happy hunting! 🥚",
].join("\n");

const READONLY_COMMANDS = [
  "rm",
  "mv",
  "cp",
  "mkdir",
  "touch",
  "chmod",
  "chown",
];

const EDITOR_COMMANDS = ["vim", "vi", "nano", "emacs"];

function cowsay(message: string): string {
  return [
    ` ${"_".repeat(message.length + 2)}`,
    `< ${message} >`,
    ` ${"-".repeat(message.length + 2)}`,
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].join("\n");
}

const NEOFETCH_ART = [
  "    .--.",
  "   |o_o |",
  "   |:_/ |",
  "  //   \\ \\",
  " (|     | )",
  "/'\\_   _/`\\",
  "\\___)=(___/",
].join("\n");

const NEOFETCH_INFO: [string, string][] = [
  ["OS", "Portfolio OS (Next.js 16)"],
  ["Host", "Vercel Edge Network"],
  ["Kernel", "React 19.2 + React Compiler"],
  ["Shell", "naosh 1.0.0"],
  ["Uptime", "engineer since 2019"],
  ["Languages", "TypeScript, Go, Python"],
  ["AI", "Cursor, Claude, Codex, Devin"],
  ["Theme", "Aurora"],
  ["Location", "Tokyo, Japan"],
];

const NEOFETCH_PALETTE = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

function Neofetch() {
  return (
    <div className="my-1 flex flex-wrap gap-x-6 gap-y-2">
      <pre className="text-emerald-400">{NEOFETCH_ART}</pre>
      <div>
        <div>
          <span className="font-semibold text-emerald-400">naoya</span>
          <span className="text-zinc-400">@</span>
          <span className="font-semibold text-emerald-400">portfolio</span>
        </div>
        <div className="text-zinc-500">-----------------</div>
        {NEOFETCH_INFO.map(([label, value]) => (
          <div key={label}>
            <span className="text-sky-400">{label}</span>
            <span className="text-zinc-400">: </span>
            <span className="text-zinc-200">{value}</span>
          </div>
        ))}
        <div className="mt-1 flex">
          {NEOFETCH_PALETTE.map((color) => (
            <span
              key={color}
              className="h-3 w-6"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const SL_ART = [
  "      ====        ________                ___________",
  "  _D _|  |_______/        \\__I_I_____===__|_________|",
  "   |(_)---  |   H\\________/ |   |        =|___ ___|  ",
  "   /     |  |   H  |  |     |   |         ||_| |_||  ",
  "  |      |  |   H  |__--------------------| [___] |  ",
  "  | ________|___H__/__|_____/[][]~\\_______|       |  ",
  "  |/ |   |-----------I_____I [][] []  D   |=======|__",
  "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__",
  " |/-=|___|=    ||    ||    ||    |_____/~\\___/       ",
  "  \\_/      \\O=====O=====O=====O_/      \\_/           ",
].join("\n");

function SlTrain() {
  const [done, setDone] = useState(false);
  if (done) return null;
  return (
    <div className="relative h-32 overflow-hidden">
      <pre
        className="sl-train absolute top-1 left-full text-[10px] leading-3 text-zinc-200"
        onAnimationEnd={() => setDone(true)}
      >
        {SL_ART}
      </pre>
    </div>
  );
}

function listEntries(
  node: Extract<FsNode, { type: "dir" }>,
  showHidden: boolean,
): { name: string; isDir: boolean }[] {
  return Object.entries(node.children)
    .filter(([name]) => showHidden || !name.startsWith("."))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, child]) => ({ name, isDir: child.type === "dir" }));
}

function renderTree(node: FsNode, prefix: string, lines: string[]): void {
  if (node.type !== "dir") return;
  const entries = listEntries(node, false);
  entries.forEach((entry, i) => {
    const isLast = i === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    lines.push(`${prefix}${connector}${entry.name}${entry.isDir ? "/" : ""}`);
    renderTree(
      node.children[entry.name],
      prefix + (isLast ? "    " : "│   "),
      lines,
    );
  });
}

export default function InteractiveTerminal({
  fs,
  welcome,
  hint,
}: InteractiveTerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cwd, setCwd] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIndex, setCmdHistoryIndex] = useState(-1);
  const [matrixActive, setMatrixActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 履歴が増えるたびに最下部へスクロールする
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [history]);

  // 日本語IME経由の全角英数・記号（ｃｄ／。。／～ など）を半角に正規化する
  const normalizeInput = (raw: string): string =>
    raw
      .replace(/[！-～]/g, (ch) =>
        String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
      )
      .replace(/　/g, " ")
      .replace(/。/g, ".");

  const execute = (raw: string): HistoryEntry[] | "clear" => {
    const tokens = normalizeInput(raw).trim().split(/\s+/);
    const command = tokens[0];
    const flags = tokens.slice(1).filter((t) => t.startsWith("-"));
    const args = tokens.slice(1).filter((t) => !t.startsWith("-"));

    switch (command) {
      case "help":
        return [{ kind: "text", text: HELP_TEXT }];

      case "pwd":
        return [
          {
            kind: "text",
            text: `/home/naoya${cwd.length ? `/${cwd.join("/")}` : ""}`,
          },
        ];

      case "whoami":
        return [{ kind: "text", text: "Naoya Tatetsu — System Engineer" }];

      case "clear":
        return "clear";

      case "echo":
        return [{ kind: "text", text: tokens.slice(1).join(" ") }];

      case "date":
        return [{ kind: "text", text: new Date().toString() }];

      case "history": {
        const list = [...cmdHistory]
          .reverse()
          .map((c, i) => `  ${i + 1}  ${c}`)
          .join("\n");
        return [{ kind: "text", text: list || "(no history yet)" }];
      }

      case "neofetch":
        return [{ kind: "neofetch" }];

      case "cowsay":
        return [{ kind: "text", text: cowsay(args.join(" ") || "Moo!") }];

      case "sl":
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          return [{ kind: "text", text: "🚂 choo choo!" }];
        }
        return [{ kind: "sl" }];

      case "matrix":
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          return [
            {
              kind: "text",
              text: "matrix: animation disabled (prefers-reduced-motion)",
            },
          ];
        }
        setMatrixActive(true);
        return [
          { kind: "text", text: "Wake up, Neo... (press any key to exit)" },
        ];

      case "sudo":
        return [
          {
            kind: "error",
            text: "you are not in the sudoers file. This incident will be reported. 👮",
          },
        ];

      case "exit":
      case "logout":
        return [
          {
            kind: "text",
            text: "logout\nThere is no escape from the portfolio. 🌀",
          },
        ];

      case "ping":
        return [
          {
            kind: "text",
            text: "PONG! 🏓 64 bytes from portfolio: icmp_seq=1 ttl=∞ time=0.1 ms",
          },
        ];

      case "ls": {
        const path = args[0] ? resolvePath(cwd, args[0]) : cwd;
        const node = getNode(fs, path);
        if (!node) {
          return [
            {
              kind: "error",
              text: `ls: cannot access '${args[0]}': No such file or directory`,
            },
          ];
        }
        if (node.type === "file") {
          return [{ kind: "text", text: args[0] }];
        }
        const showHidden = flags.some((f) => f.includes("a"));
        return [{ kind: "ls", entries: listEntries(node, showHidden) }];
      }

      case "cd": {
        const target = args[0] ?? "~";
        const path = resolvePath(cwd, target);
        const node = getNode(fs, path);
        if (!node) {
          return [
            { kind: "error", text: `cd: ${target}: No such file or directory` },
          ];
        }
        if (node.type !== "dir") {
          return [{ kind: "error", text: `cd: ${target}: Not a directory` }];
        }
        setCwd(path);
        return [];
      }

      case "cat": {
        if (args.length === 0) {
          return [{ kind: "error", text: "cat: missing file operand" }];
        }
        const results: HistoryEntry[] = [];
        for (const arg of args) {
          const node = getNode(fs, resolvePath(cwd, arg));
          if (!node) {
            results.push({
              kind: "error",
              text: `cat: ${arg}: No such file or directory`,
            });
          } else if (node.type === "dir") {
            results.push({
              kind: "error",
              text: `cat: ${arg}: Is a directory`,
            });
          } else {
            results.push({ kind: "text", text: node.content });
          }
        }
        return results;
      }

      case "tree": {
        const path = args[0] ? resolvePath(cwd, args[0]) : cwd;
        const node = getNode(fs, path);
        if (node?.type !== "dir") {
          return [
            {
              kind: "error",
              text: `tree: '${args[0] ?? "."}': No such directory`,
            },
          ];
        }
        const lines = [formatCwd(path)];
        renderTree(node, "", lines);
        return [{ kind: "text", text: lines.join("\n") }];
      }

      default:
        if (READONLY_COMMANDS.includes(command)) {
          return [
            {
              kind: "error",
              text: `${command}: cannot modify anything: Read-only file system (nice try 😏)`,
            },
          ];
        }
        if (EDITOR_COMMANDS.includes(command)) {
          return [
            {
              kind: "text",
              text: `${command}: opening editor... just kidding. you'd never be able to exit. 😉`,
            },
          ];
        }
        return [
          {
            kind: "error",
            text: `${command}: command not found (try 'help')`,
          },
        ];
    }
  };

  const handleSubmit = () => {
    const raw = input;
    const trimmed = raw.trim();
    setInput("");
    setCmdHistoryIndex(-1);

    const cmdEntry: HistoryEntry = {
      kind: "cmd",
      cwd: formatCwd(cwd),
      text: raw,
    };

    if (!trimmed) {
      setHistory((prev) => [...prev, cmdEntry]);
      return;
    }

    setCmdHistory((prev) => [trimmed, ...prev]);
    const result = execute(trimmed);
    if (result === "clear") {
      setHistory([]);
      return;
    }
    setHistory((prev) => [...prev, cmdEntry, ...result]);
  };

  const handleTabComplete = () => {
    const tokens = input.split(/\s+/);
    const last = tokens[tokens.length - 1];

    // 先頭トークンはコマンド名として補完
    if (tokens.length === 1) {
      const matches = COMMANDS.filter((c) => c.startsWith(last));
      if (matches.length === 1) setInput(`${matches[0]} `);
      return;
    }

    // それ以降はパスとして補完
    const slashIndex = last.lastIndexOf("/");
    const parentPart = slashIndex >= 0 ? last.slice(0, slashIndex + 1) : "";
    const namePart = slashIndex >= 0 ? last.slice(slashIndex + 1) : last;
    const parentNode = getNode(
      fs,
      parentPart ? resolvePath(cwd, parentPart) : cwd,
    );
    if (parentNode?.type !== "dir") return;

    const matches = listEntries(parentNode, namePart.startsWith(".")).filter(
      (e) => e.name.startsWith(namePart),
    );
    if (matches.length === 1) {
      const completed =
        parentPart + matches[0].name + (matches[0].isDir ? "/" : " ");
      setInput([...tokens.slice(0, -1), completed].join(" "));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // マトリックス表示中は何かキーを押したら復帰する
    if (matrixActive) {
      e.preventDefault();
      setMatrixActive(false);
      return;
    }
    // IMEの変換中（変換確定のEnterなど）はコマンドとして扱わない
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleTabComplete();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cmdHistoryIndex + 1, cmdHistory.length - 1);
      if (next >= 0 && cmdHistory[next] !== undefined) {
        setCmdHistoryIndex(next);
        setInput(cmdHistory[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = cmdHistoryIndex - 1;
      setCmdHistoryIndex(Math.max(next, -1));
      setInput(next >= 0 ? cmdHistory[next] : "");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  const focusInput = () => {
    // テキスト選択（コピー）中はフォーカスを奪わない
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus();
  };

  const prompt = (cwdLabel: string) => (
    <>
      <span className="text-emerald-400">naoya@portfolio</span>
      <span className="text-zinc-400">:</span>
      <span className="text-sky-400">{cwdLabel}</span>
      <span className="whitespace-pre text-zinc-400">{" $ "}</span>
    </>
  );

  return (
    /* biome-ignore lint/a11y/useKeyWithClickEvents: クリックは内部の input へのフォーカス移譲のみ */
    /* biome-ignore lint/a11y/noStaticElementInteractions: 同上 */
    <div
      className="relative w-full max-w-2xl cursor-text overflow-hidden rounded-xl border border-zinc-700/60 bg-zinc-900/90 text-left shadow-2xl shadow-purple-500/10 backdrop-blur-sm"
      onClick={focusInput}
    >
      {matrixActive && (
        <button
          type="button"
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setMatrixActive(false);
          }}
          aria-label="Exit matrix"
        >
          <MatrixRain className="h-full w-full" />
        </button>
      )}
      <div className="flex items-center gap-2 border-b border-zinc-700/60 bg-zinc-800/80 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-zinc-400">
          naoya@portfolio: {formatCwd(cwd)}
        </span>
      </div>
      <div
        ref={scrollRef}
        className="h-80 overflow-y-auto px-4 py-3 font-mono text-sm leading-6 text-zinc-100"
      >
        <div className="mb-2 text-zinc-400">
          <div>{welcome}</div>
          <div>{hint}</div>
        </div>
        {history.map((entry, i) => {
          const key = i;
          if (entry.kind === "neofetch") {
            return <Neofetch key={key} />;
          }
          if (entry.kind === "sl") {
            return <SlTrain key={key} />;
          }
          if (entry.kind === "cmd") {
            return (
              <div key={key} className="break-all">
                {prompt(entry.cwd)}
                <span>{entry.text}</span>
              </div>
            );
          }
          if (entry.kind === "ls") {
            return (
              <div key={key} className="flex flex-wrap gap-x-6 gap-y-0.5">
                {entry.entries.length === 0 ? (
                  <span className="text-zinc-500">(empty)</span>
                ) : (
                  entry.entries.map((e) => (
                    <span
                      key={e.name}
                      className={e.isDir ? "font-semibold text-sky-400" : ""}
                    >
                      {e.name}
                      {e.isDir ? "/" : ""}
                    </span>
                  ))
                )}
              </div>
            );
          }
          return (
            <div
              key={key}
              className={`whitespace-pre-wrap break-words ${
                entry.kind === "error" ? "text-red-400" : "text-zinc-300"
              }`}
            >
              {entry.text}
            </div>
          );
        })}
        <div className="flex items-baseline break-all">
          {prompt(formatCwd(cwd))}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-zinc-100 caret-emerald-400 outline-none"
            aria-label="terminal command input"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  );
}
