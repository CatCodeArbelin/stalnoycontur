import type { Metadata } from "next";

import { Advantages, CasesMapReviewsFaqContacts, Hero, SolutionsProductionSteps, Types } from "@/components/sections/home-sections";
import { QuizCalculator } from "@/components/lead-form";
import { FAQPageJsonLd, ReviewJsonLd } from "@/components/seo";
import { metadataForPath } from "@/lib/seo";

export const metadata: Metadata = metadataForPath("/");

export default function Home() {
  return (
    <>
      <FAQPageJsonLd items={[{ question: "Сколько длится монтаж навеса?", answer: "Обычно монтаж занимает от двух дней после подготовки проекта и материалов." }, { question: "Работаете ли вы по всему Крыму?", answer: "Да, бригады выезжают в Симферополь, Севастополь, Ялту, Евпаторию, Алушту, Феодосию, Керчь и другие города." }]} />
      <ReviewJsonLd author="Алексей" text="Сделали навес для двух машин, помогли выбрать цвет под забор. Монтаж занял два дня, участок оставили чистым." ratingValue={5} />
      <Hero />
      <Advantages />
      <QuizCalculator />
      <Types />
      <SolutionsProductionSteps />
      <CasesMapReviewsFaqContacts />
    </>
  );
}
