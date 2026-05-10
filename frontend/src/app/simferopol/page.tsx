import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { cityContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = cityContent["simferopol"];

export const metadata: Metadata = metadataForPath("/simferopol");

export default function Page() {
  return <LandingPage path="/simferopol" badge="Город монтажа" title={content.title} description={content.description} points={["бесплатный выезд на замер", "договор и фиксированная смета", "монтаж навесов для дома, авто и бизнеса"]} />;
}
