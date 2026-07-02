import Image from "next/image";
import { getTranslations } from "next-intl/server";
import ConsoleEasterEgg from "@/components/ConsoleEasterEgg";
import InteractiveTerminal from "@/components/InteractiveTerminal";
import KonamiCode from "@/components/KonamiCode";
import NavCards from "@/components/NavCards";
import Reveal from "@/components/Reveal";
import {
  buildTerminalFs,
  type ExperienceItem,
  type NewsItem,
  type ProfileItem,
} from "@/lib/terminal-fs";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Home({ params }: PageProps) {
  await params;
  const t = await getTranslations("home");
  const profileT = await getTranslations("profile");
  const experienceT = await getTranslations("experience");
  const newsT = await getTranslations("news");

  const fs = buildTerminalFs(
    profileT.raw("items") as ProfileItem[],
    experienceT.raw("items") as ExperienceItem[],
    newsT.raw("items") as NewsItem[],
  );

  const pages = [
    { name: t("profile"), path: "/profile", icon: "👤" },
    { name: t("news"), path: "/news", icon: "📰" },
    { name: t("blog"), path: "/blog", icon: "📝" },
    { name: t("experience"), path: "/experience", icon: "🏢" },
    { name: t("contact"), path: "/contact", icon: "📧" },
  ];

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-16 self-start px-6 pt-10 pb-24 font-sans">
      <ConsoleEasterEgg />
      <KonamiCode />

      <section className="flex w-full flex-col items-center">
        <Image
          src="/dev_icon.svg"
          alt="dev icon"
          width={320}
          height={320}
          priority
          className="mb-8 rounded-full w-32 h-32 md:w-44 md:h-44 lg:w-44 lg:h-44 shadow-lg dark:shadow-xl dark:shadow-zinc-800/50"
        />
        <InteractiveTerminal
          fs={fs}
          welcome={t("terminalWelcome")}
          hint={t("terminalHint")}
        />
      </section>

      <Reveal className="w-full max-w-2xl">
        <NavCards pages={pages} />
      </Reveal>
    </div>
  );
}
