import type { Metadata } from "next";
import Image from "next/image";

import { CasesMapReviewsFaqContacts } from "@/components/sections/home-sections";
import { BreadcrumbListJsonLd } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getManagedContent } from "@/lib/content-api";
import { metadataForPath } from "@/lib/seo";

export const metadata: Metadata = metadataForPath("/cases");

export default async function CasesPage() {
  const content = await getManagedContent();
  return (
    <>
      <BreadcrumbListJsonLd items={[{ name: "Главная", url: "/" }, { name: "Кейсы", url: "/cases" }]} />
      <section className="bg-steel-900 py-16 text-white md:py-24">
        <div className="container">
          <Badge className="border-border/40 bg-card/10 text-copper-400">Портфолио</Badge>
          <h1 className="mt-5 text-4xl font-black md:text-6xl">Кейсы навесов в Крыму</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">Подборка объектов с разными типами каркаса, кровли и условий монтажа.</p>
        </div>
      </section>
      <section className="section-padding">
        <div className="container grid gap-6 md:grid-cols-3">
          {content.cases.map((item) => (
            <Card key={item.slug ?? item.title} className="overflow-hidden">
              <Image src={item.cover_image || "/images/case-1.svg"} alt={item.title} width={560} height={360} loading="lazy" sizes="(min-width: 768px) 33vw, 100vw" className="h-56 w-full object-cover" />
              <div className="p-6"><h2 className="text-xl font-black">{item.title}</h2>{item.city ? <p className="mt-2 text-muted-foreground">{item.city}</p> : null}{item.description ? <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}{item.materials?.length ? <p className="mt-3 font-black text-copper-600">{item.materials.join(" · ")}</p> : null}</div>
            </Card>
          ))}
        </div>
      </section>
      <CasesMapReviewsFaqContacts
        cases={content.cases}
        settings={content.settings}
      />
    </>
  );
}
