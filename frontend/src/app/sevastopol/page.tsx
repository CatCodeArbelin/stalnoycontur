import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { cityContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = cityContent["sevastopol"];

export const metadata: Metadata = metadataForPath("/sevastopol");

export default function Page() {
  return <LandingPage path="/sevastopol" badge="Город монтажа" title={content.title} description={content.description} points={["бесплатный выезд на замер", "договор и фиксированная смета", "монтаж навесов для дома, авто и бизнеса"]} />;
}
