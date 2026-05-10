import { Advantages, CasesMapReviewsFaqContacts, Hero, QuizCalculator, SolutionsProductionSteps, Types } from "@/components/sections/home-sections";

export default function Home() {
  return (
    <>
      <Hero />
      <Advantages />
      <QuizCalculator />
      <Types />
      <SolutionsProductionSteps />
      <CasesMapReviewsFaqContacts />
    </>
  );
}
