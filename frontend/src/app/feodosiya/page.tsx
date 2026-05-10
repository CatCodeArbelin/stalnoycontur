import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { cityContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = cityContent["feodosiya"];

export const metadata: Metadata = metadataForPath("/feodosiya");

export default function Page() {
  return <LandingPage path="/feodosiya" badge="Город монтажа" title={content.title} description={content.description} points={["бесплатный выезд на замер", "договор и фиксированная смета", "монтаж навесов для дома, авто и бизнеса"]} />;
}
