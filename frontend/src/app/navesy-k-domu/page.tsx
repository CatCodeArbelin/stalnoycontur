import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = pageContent["navesy-k-domu"];

export const metadata: Metadata = metadataForPath("/navesy-k-domu");

export default function Page() {
  return <LandingPage path="/navesy-k-domu" {...content} />;
}
