import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

import { QuizCalculator } from "@/components/lead-form";
import { CasesMapReviewsFaqContacts, Types } from "@/components/sections/home-sections";
import { BreadcrumbListJsonLd } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getManagedContent, type PublicLandingPage } from "@/lib/content-api";

type LegacyLandingPageProps = {
  path: string;
  badge: string;
  title: string;
  description: string;
  points: string[];
  page?: never;
};

type PublicLandingPageProps = {
  path: string;
  page: PublicLandingPage;
  badge?: never;
  title?: never;
  description?: never;
  points?: never;
};

type LandingPageProps = LegacyLandingPageProps | PublicLandingPageProps;

function getLandingPageContent(props: LandingPageProps) {
  if (props.page) {
    return {
      badge: props.page.hero_badge || props.page.title,
      title: props.page.hero_title,
      description: props.page.hero_description || props.page.meta_description || props.page.title,
      points: props.page.points ?? [],
    };
  }

  return {
    badge: props.badge,
    title: props.title,
    description: props.description,
    points: props.points,
  };
}

export async function LandingPage(props: LandingPageProps) {
  const content = await getManagedContent();
  const { badge, title, description, points } = getLandingPageContent(props);

  return (
    <>
      <BreadcrumbListJsonLd items={[{ name: "Главная", url: "/" }, { name: title, url: props.path }]} />
      <section className="bg-steel-900 py-16 text-white md:py-24">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge className="border-border/40 bg-card/10 text-copper-400">{badge}</Badge>
            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
            <p className="mt-5 text-lg leading-8 text-white/70">{description}</p>
            {points.length ? (
              <div className="mt-7 grid gap-3">
                {points.map((point) => <div key={point} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-copper-400" /><span>{point}</span></div>)}
              </div>
            ) : null}
            <Button asChild className="mt-8" size="lg" variant="copper"><a href="#contacts">Заказать расчет</a></Button>
          </div>
          <Image src="/images/hero-canopy.svg" alt={title} width={780} height={560} priority sizes="(min-width: 1024px) 50vw, 100vw" className="rounded-[2.5rem] bg-card/10 p-3" />
        </div>
      </section>
      <QuizCalculator settings={content.settings} />
      <Types />
      <CasesMapReviewsFaqContacts
        cases={content.cases}
        settings={content.settings}
      />
    </>
  );
}
