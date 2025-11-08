import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function BlogPage({ params }: PageProps) {
  await params;
  notFound();
}
