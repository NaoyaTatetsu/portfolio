import {
  AcademicCapIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

const timelineIcons = {
  company: BuildingOfficeIcon,
  school: AcademicCapIcon,
} as const;

export default async function ExperiencePage({ params }: PageProps) {
  await params;
  const t = await getTranslations("pages");
  const experienceT = await getTranslations("experience");

  const items = experienceT.raw("items") as Array<{
    school: string;
    icon: keyof typeof timelineIcons;
    period: string;
    major: string;
    description: string[];
  }>;

  return (
    <div className="w-full px-4 pt-7 self-start">
      <div className="max-w-7xl mx-auto">
        <div className="text-3xl mb-14 text-center font-bold">
          {t("experience")}
        </div>
        <div className="flex flex-col items-center">
          {items.map((item) => {
            const TimelineIcon = timelineIcons[item.icon] ?? BuildingOfficeIcon;
            return (
              <div key={item.school} className="flex gap-4 w-full max-w-xl">
                <div className="flex flex-col items-center">
                  <TimelineIcon className="w-5 h-5" />
                  <div className="w-0.5 bg-gray-300 dark:bg-gray-700 flex-1"></div>
                </div>
                <div className="flex-1 mb-8 text-left">
                  <div className="text-sm mb-2">{item.period}</div>
                  <h3 className="text-xl font-semibold mb-2">{item.school}</h3>
                  <div className="italic mb-2">{item.major}</div>
                  {item.description && item.description.length > 0 && (
                    <ul className="list-disc list-inside space-y-1">
                      {item.description.map((desc) => (
                        <li key={`${item.school}-${desc}`} className="text-sm">
                          {desc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
