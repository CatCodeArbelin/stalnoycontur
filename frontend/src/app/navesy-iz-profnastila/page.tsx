import { LandingPage } from "@/components/landing-page";
import { pageContent } from "@/data/site";

const content = pageContent["navesy-iz-profnastila"];

export default function Page() {
  return <LandingPage {...content} />;
}
