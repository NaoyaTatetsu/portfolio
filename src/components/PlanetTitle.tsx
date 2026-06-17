interface PlanetTitleProps {
  text: string;
  className?: string;
}

const PALETTE = ["#f4e5cc", "#fff4dc", "#c5e8e3", "#fde0d4", "#e0eddb"];

export default function PlanetTitle({
  text,
  className = "",
}: PlanetTitleProps) {
  const counts = new Map<string, number>();
  const letters = text.split("").map((letter) => {
    const n = (counts.get(letter) ?? 0) + 1;
    counts.set(letter, n);
    return { letter, key: `${letter}#${n}` };
  });
  const center = (letters.length - 1) / 2;

  return (
    <h1
      className={`flex justify-center gap-1 md:gap-1.5 font-display font-bold tracking-tight select-none ${className}`}
      aria-label={text}
    >
      {letters.map(({ letter, key }, i) => {
        const offset = i - center;
        const rotate = offset * 3.5;
        const translateY = Math.abs(offset) * 1.5;
        const bg = PALETTE[i % PALETTE.length];
        return (
          <span
            key={key}
            aria-hidden="true"
            className="inline-block px-2 py-1 md:px-3 md:py-1.5 rounded-md border-2 border-zinc-900 dark:border-zinc-50 text-zinc-900 shadow-[3px_3px_0_0_rgba(0,0,0,0.85)] dark:shadow-[3px_3px_0_0_rgba(255,255,255,0.7)]"
            style={{
              transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
              backgroundColor: bg,
            }}
          >
            {letter}
          </span>
        );
      })}
    </h1>
  );
}
