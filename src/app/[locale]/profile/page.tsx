import Image from "next/image";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

interface ProfileItem {
  title: string;
  description: string;
}

interface TechIcon {
  name: string;
  src: string;
  // モノクロSVGはダークモードで白に反転させる
  invertOnDark?: boolean;
}

const skillIcons: TechIcon[] = [
  { name: "TypeScript", src: "/icons/typescript.svg" },
  { name: "Golang", src: "/icons/go.svg" },
  { name: "Python", src: "/icons/python.svg" },
  { name: "Docker", src: "/icons/docker.svg" },
  { name: "Terraform", src: "/icons/terraform.svg" },
  { name: "AWS", src: "/icons/aws.svg" },
  { name: "GCP", src: "/icons/googlecloud.svg" },
];

const toolAndAiIcons: TechIcon[] = [
  { name: "GitHub", src: "/icons/github.svg", invertOnDark: true },
  { name: "WezTerm", src: "/icons/wezterm.svg" },
  { name: "Docker", src: "/icons/docker.svg" },
  { name: "Cursor", src: "/icons/cursor.svg", invertOnDark: true },
  { name: "Codex", src: "/icons/openai.svg", invertOnDark: true },
  { name: "Claude", src: "/icons/claude.svg" },
  { name: "Devin", src: "/icons/devin.png" },
  { name: "Gemini", src: "/icons/googlegemini.svg" },
];

function IconRow({ icons }: { icons: TechIcon[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {icons.map((icon) => (
        <Image
          key={icon.name}
          src={icon.src}
          alt={icon.name}
          title={icon.name}
          width={32}
          height={32}
          className={`w-8 h-8 ${icon.invertOnDark ? "dark:invert" : ""}`}
        />
      ))}
    </div>
  );
}

export default async function ProfilePage({ params }: PageProps) {
  await params;
  const t = await getTranslations("pages");
  const profileT = await getTranslations("profile");

  const basicItems = profileT.raw("basic") as ProfileItem[];

  const iconSections = [
    { title: profileT("skills"), icons: skillIcons },
    { title: profileT("toolsAndAi"), icons: toolAndAiIcons },
  ];

  return (
    <div className="w-full px-4 pt-7 pb-20 self-start">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <div className="text-3xl mb-6 text-center font-bold">
            {t("profile")}
          </div>
          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 pb-8 text-left flex flex-col gap-14">
            <div>
              <div className="space-y-3">
                <div className="text-xl font-bold">{profileT("about")}</div>
                <div className="space-y-2">
                  {basicItems.map((item) => (
                    <div key={item.title} className="flex gap-2 break-words">
                      <span className="font-semibold">{item.title}</span>
                      <span>:</span>
                      <span>{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {iconSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <div className="text-xl font-bold">{section.title}</div>
                <IconRow icons={section.icons} />
              </div>
            ))}
            <div className="space-y-2">
              <div className="text-xl font-bold">{profileT("favorite")}</div>
              <div className="text-sm break-words">
                {profileT("favoriteDescription")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
