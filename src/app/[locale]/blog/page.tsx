import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function BlogPage({ params }: PageProps) {
  await params;
  notFound();
}
