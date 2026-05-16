import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

import { QuizCalculator } from "@/components/lead-form";
import { CasesMapReviewsFaqContacts, Types } from "@/components/sections/home-sections";
import { BreadcrumbListJsonLd, FAQPageJsonLd } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getManagedContent } from "@/lib/content-api";

export async function LandingPage({ badge, title, description, points, path }: { badge: string; title: string; description: string; points: string[]; path: string }) {
  const content = await getManagedContent();

  return (
    <>
      <BreadcrumbListJsonLd items={[{ name: "Главная", url: "/" }, { name: title, url: path }]} />
      <FAQPageJsonLd items={[{ question: "Как получить точную смету?", answer: "Оставьте заявку и пришлите размеры или фото участка: инженер уточнит задачу, предложит конструкцию и зафиксирует смету в договоре." }, { question: "Что входит в работу под ключ?", answer: "Замер, проект, изготовление каркаса, доставка, монтаж кровли, водосток по необходимости и уборка площадки." }]} />
      <section className="bg-steel-900 py-16 text-white md:py-24">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge className="border-border/40 bg-card/10 text-copper-400">{badge}</Badge>
            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
            <p className="mt-5 text-lg leading-8 text-white/70">{description}</p>
            <div className="mt-7 grid gap-3">
              {points.map((point) => <div key={point} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-copper-400" /><span>{point}</span></div>)}
            </div>
            <Button asChild className="mt-8" size="lg" variant="copper"><a href="#contacts">Заказать расчет</a></Button>
          </div>
          <Image src="/images/hero-canopy.svg" alt={title} width={780} height={560} priority sizes="(min-width: 1024px) 50vw, 100vw" className="rounded-[2.5rem] bg-card/10 p-3" />
        </div>
      </section>
      <QuizCalculator settings={content.settings} />
      <Types />
      <CasesMapReviewsFaqContacts cases={content.cases} reviews={content.reviews} faq={content.faq} settings={content.settings} />
    </>
  );
}
