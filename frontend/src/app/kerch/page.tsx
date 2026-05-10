import { LandingPage } from "@/components/landing-page";
import { cityContent } from "@/data/site";

const content = cityContent["kerch"];

export default function Page() {
  return <LandingPage badge="Город монтажа" title={content.title} description={content.description} points={["бесплатный выезд на замер", "договор и фиксированная смета", "монтаж навесов для дома, авто и бизнеса"]} />;
}
