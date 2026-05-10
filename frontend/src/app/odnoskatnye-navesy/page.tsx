import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";
import { metadataForPath } from "@/lib/seo";

const content = pageContent["odnoskatnye-navesy"];

export const metadata: Metadata = metadataForPath("/odnoskatnye-navesy");

export default function Page() {
  return <LandingPage path="/odnoskatnye-navesy" {...content} />;
}
