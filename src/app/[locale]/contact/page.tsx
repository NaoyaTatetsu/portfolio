import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function ContactPage({ params }: PageProps) {
  await params;
  notFound();
}
