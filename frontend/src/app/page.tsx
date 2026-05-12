import type { Metadata } from "next";

import { Advantages, CasesMapReviewsFaqContacts, Hero, SolutionsProductionSteps, Types } from "@/components/sections/home-sections";
import { QuizCalculator } from "@/components/lead-form";
import { FAQPageJsonLd, ReviewJsonLd } from "@/components/seo";
import { getManagedContent } from "@/lib/content-api";
import { metadataForPath } from "@/lib/seo";

export const metadata: Metadata = metadataForPath("/");

export default async function Home() {
  const content = await getManagedContent();

  return (
    <>
      <FAQPageJsonLd items={content.faq.slice(0, 2)} />
      <ReviewJsonLd author={content.reviews[0]?.author ?? "Алексей"} text={content.reviews[0]?.text ?? "Сделали навес для двух машин, помогли выбрать цвет под забор. Монтаж занял два дня, участок оставили чистым."} ratingValue={5} />
      <Hero />
      <Advantages />
      <QuizCalculator settings={content.settings} />
      <Types />
      <SolutionsProductionSteps />
      <CasesMapReviewsFaqContacts cases={content.cases} reviews={content.reviews} faq={content.faq} settings={content.settings} />
    </>
  );
}
