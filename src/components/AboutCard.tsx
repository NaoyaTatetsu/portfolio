import Tilt from "@/components/Tilt";

interface ProfileItem {
  title: string;
  description: string;
}

interface AboutCardProps {
  /** messages の profile.basic 配列（[名前, 年齢, 会社/住居, 出身] の順を前提とする） */
  items: ProfileItem[];
  /** カード中央に大きく表示するハンドル */
  handle: string;
}

// cloudflare.pay のウォレットカードを模した About カード。
// 配色・レイアウトは参考サイトから採取した値に合わせている
export default function AboutCard({ items, handle }: AboutCardProps) {
  const [name, age, workLive, from] = items;

  return (
    <Tilt className="mx-auto w-full max-w-xs" maxTilt={10} hoverScale={1.03}>
      <div className="about-card flex aspect-[1.76/1] w-full flex-col justify-between rounded-2xl p-4 text-[#e9e7de] shadow-[0_16px_40px_rgba(0,0,0,0.25)] [transform-style:preserve-3d] dark:text-[#1e2126]">
        <div className="flex items-start justify-between [transform:translateZ(6px)]">
          <div className="text-sm font-bold">{name.description}</div>
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#e9e7de]/60 dark:text-[#1e2126]/65">
            {age.title} / {age.description}
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center [transform:translateZ(10px)]">
          <div className="text-xl font-bold tracking-tight drop-shadow-[0_2px_1px_rgba(0,0,0,0.2)] md:text-2xl">
            {handle}
          </div>
        </div>
        <div className="flex items-end justify-between gap-4 [transform:translateZ(6px)]">
          <div className="space-y-0.5">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e9e7de]/60 dark:text-[#1e2126]/65">
              {workLive.title}
            </div>
            <div className="font-mono text-xs font-bold uppercase tracking-[0.1em]">
              {workLive.description}
            </div>
          </div>
          <div className="space-y-0.5 text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#e9e7de]/60 dark:text-[#1e2126]/65">
              {from.title}
            </div>
            <div className="font-mono text-xs font-bold uppercase tracking-[0.1em]">
              {from.description}
            </div>
          </div>
        </div>
      </div>
    </Tilt>
  );
}
