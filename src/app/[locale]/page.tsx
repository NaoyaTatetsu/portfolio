import DeskExperience from "@/components/desk/DeskExperience";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function Home({ params }: PageProps) {
  await params;
  return <DeskExperience />;
}
