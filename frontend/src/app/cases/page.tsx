import Image from "next/image";

import { CasesMapReviewsFaqContacts } from "@/components/sections/home-sections";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cases } from "@/data/site";

export default function CasesPage() {
  return (
    <>
      <section className="bg-steel-900 py-16 text-white md:py-24">
        <div className="container">
          <Badge className="border-white/20 bg-white/10 text-copper-400">Портфолио</Badge>
          <h1 className="mt-5 text-4xl font-black md:text-6xl">Кейсы навесов в Крыму</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">Подборка объектов с разными типами каркаса, кровли и условий монтажа.</p>
        </div>
      </section>
      <section className="section-padding">
        <div className="container grid gap-6 md:grid-cols-3">
          {cases.concat(cases).map((item, index) => (
            <Card key={`${item.title}-${index}`} className="overflow-hidden">
              <Image src={item.image} alt={item.title} width={560} height={360} loading="lazy" sizes="(min-width: 768px) 33vw, 100vw" className="h-56 w-full object-cover" />
              <div className="p-6"><h2 className="text-xl font-black">{item.title}</h2><p className="mt-2 text-muted-foreground">{item.place}</p><p className="mt-3 font-black text-copper-600">{item.price}</p></div>
            </Card>
          ))}
        </div>
      </section>
      <CasesMapReviewsFaqContacts />
    </>
  );
}
