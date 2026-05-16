import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = pageContent["arochnye-navesy"];

export const metadata: Metadata = metadataForPath("/arochnye-navesy");

export default function Page() {
  return <LandingPage path="/arochnye-navesy" {...content} />;
}
