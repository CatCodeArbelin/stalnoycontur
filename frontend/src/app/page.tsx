import type { Metadata } from "next";

import {
  CasesMapReviewsFaqContacts,
  Hero,
  Types,
} from "@/components/sections/home-sections";
import { QuizCalculator } from "@/components/lead-form";
import { FAQPageJsonLd } from "@/components/seo";
import { getManagedContent } from "@/lib/content-api";
import { metadataForPath } from "@/lib/seo";

export const metadata: Metadata = metadataForPath("/");

export default async function Home() {
  const content = await getManagedContent();

  return (
    <>
      <FAQPageJsonLd items={content.faq.slice(0, 2)} />
      <Hero />
      <QuizCalculator settings={content.settings} />
      <Types />
      <CasesMapReviewsFaqContacts
        cases={content.cases}
        faq={content.faq}
        settings={content.settings}
      />
    </>
  );
}
