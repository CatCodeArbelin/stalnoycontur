import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = pageContent["navesy-dlya-avto"];

export const metadata: Metadata = metadataForPath("/navesy-dlya-avto");

export default function Page() {
  return <LandingPage path="/navesy-dlya-avto" {...content} />;
}
