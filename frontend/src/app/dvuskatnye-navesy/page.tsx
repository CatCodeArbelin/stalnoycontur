import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = pageContent["dvuskatnye-navesy"];

export const metadata: Metadata = metadataForPath("/dvuskatnye-navesy");

export default function Page() {
  return <LandingPage path="/dvuskatnye-navesy" {...content} />;
}
