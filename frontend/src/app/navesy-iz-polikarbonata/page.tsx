import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = pageContent["navesy-iz-polikarbonata"];

export const metadata: Metadata = metadataForPath("/navesy-iz-polikarbonata");

export default function Page() {
  return <LandingPage path="/navesy-iz-polikarbonata" {...content} />;
}
