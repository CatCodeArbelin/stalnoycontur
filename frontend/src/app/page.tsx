import type { Metadata } from "next";

import {
  CasesMapReviewsFaqContacts,
  Hero,
  Types,
} from "@/components/sections/home-sections";
import { QuizCalculator } from "@/components/lead-form";
import { getManagedContent } from "@/lib/content-api";
import { metadataForPath } from "@/lib/seo";

export const metadata: Metadata = metadataForPath("/");

export default async function Home() {
  const content = await getManagedContent();

  return (
    <>
      <Hero />
      <QuizCalculator settings={content.settings} />
      <Types />
      <CasesMapReviewsFaqContacts
        cases={content.cases}
        settings={content.settings}
      />
    </>
  );
}
