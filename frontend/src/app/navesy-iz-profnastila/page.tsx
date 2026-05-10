import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = pageContent["navesy-iz-profnastila"];

export const metadata: Metadata = metadataForPath("/navesy-iz-profnastila");

export default function Page() {
  return <LandingPage path="/navesy-iz-profnastila" {...content} />;
}
