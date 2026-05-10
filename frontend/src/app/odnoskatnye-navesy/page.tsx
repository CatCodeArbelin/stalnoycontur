import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";

const content = pageContent["odnoskatnye-navesy"];

export default function Page() {
  return <LandingPage {...content} />;
}
