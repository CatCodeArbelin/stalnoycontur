import { CheckCircle2 } from "lucide-react";
import Image from "next/image";

import { CasesMapReviewsFaqContacts, QuizCalculator, Types } from "@/components/sections/home-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function LandingPage({ badge, title, description, points }: { badge: string; title: string; description: string; points: string[] }) {
  return (
    <>
      <section className="bg-steel-900 py-16 text-white md:py-24">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge className="border-white/20 bg-white/10 text-copper-400">{badge}</Badge>
            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">{title}</h1>
            <p className="mt-5 text-lg leading-8 text-white/70">{description}</p>
            <div className="mt-7 grid gap-3">
              {points.map((point) => <div key={point} className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-copper-400" /><span>{point}</span></div>)}
            </div>
            <Button asChild className="mt-8" size="lg" variant="copper"><a href="#contacts">Заказать расчет</a></Button>
          </div>
          <Image src="/images/hero-canopy.svg" alt={title} width={780} height={560} priority sizes="(min-width: 1024px) 50vw, 100vw" className="rounded-[2.5rem] bg-white/10 p-3" />
        </div>
      </section>
      <QuizCalculator />
      <Types />
      <CasesMapReviewsFaqContacts />
    </>
  );
}
