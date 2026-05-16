import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing-page";
import { getPublicLandingPage } from "@/lib/content-api";
import { createPageMetadata, siteConfig } from "@/lib/seo";

type DynamicLandingPageProps = {
  params: Promise<{ slug: string }>;
};

async function getLandingPageFromParams(params: DynamicLandingPageProps["params"]) {
  const { slug } = await params;
  const landingPage = await getPublicLandingPage(slug);

  return { slug, landingPage };
}

export async function generateMetadata({
  params,
}: DynamicLandingPageProps): Promise<Metadata> {
  const { slug, landingPage } = await getLandingPageFromParams(params);

  if (!landingPage) {
    notFound();
  }

  return createPageMetadata({
    path: `/${slug}`,
    title: landingPage.meta_title || `${landingPage.title} — ${siteConfig.name}`,
    description:
      landingPage.meta_description ||
      landingPage.hero_description ||
      siteConfig.defaultDescription,
  });
}

export default async function DynamicLandingPage({ params }: DynamicLandingPageProps) {
  const { slug, landingPage } = await getLandingPageFromParams(params);

  if (!landingPage) {
    notFound();
  }

  return <LandingPage path={`/${slug}`} page={landingPage} />;
}
