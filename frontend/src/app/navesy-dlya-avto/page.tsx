import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";

const content = pageContent["navesy-dlya-avto"];

export default function Page() {
  return <LandingPage {...content} />;
}
