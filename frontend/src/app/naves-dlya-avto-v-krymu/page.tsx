import { CheckCircle2, MapPin, Ruler, ShieldCheck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { ContactLeadForm, QuizCalculator } from "@/components/lead-form";
import { BreadcrumbListJsonLd } from "@/components/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getManagedContent } from "@/lib/content-api";
import { metadataForPath } from "@/lib/seo";

export const metadata: Metadata = metadataForPath("/naves-dlya-avto-v-krymu");

const path = "/naves-dlya-avto-v-krymu";

const benefits = [
  {
    icon: Ruler,
    title: "Замер",
    text: "Бесплатно выезжаем на участок, проверяем заезд, уклоны, ветровую нагрузку и точки крепления.",
  },
  {
    icon: Wrench,
    title: "Производство",
    text: "Изготавливаем металлический каркас под размер автомобиля, двора и выбранный материал кровли.",
  },
  {
    icon: CheckCircle2,
    title: "Монтаж",
    text: "Привозим готовые элементы, устанавливаем опоры, фермы, кровлю и водоотвод без затяжных работ.",
  },
  {
    icon: ShieldCheck,
    title: "Гарантия",
    text: "Фиксируем комплектацию в договоре и даем гарантию на каркас, покрытие и монтажные работы.",
  },
];

const sizeOptions = [
  {
    size: "3×4 м",
    purpose: "компактный навес для одного легкового авто",
    materials: "поликарбонат 6–8 мм, профильная труба",
  },
  {
    size: "4×6 м",
    purpose: "универсальное решение для седана, кроссовера или зоны хранения",
    materials: "поликарбонат 8–10 мм или профнастил C20/C21",
  },
  {
    size: "6×6 м",
    purpose: "парковка для двух автомобилей рядом",
    materials: "усиленные фермы, профнастил или металлочерепица",
  },
  {
    size: "6×8 м",
    purpose: "просторный автонавес для двух машин и прохода вокруг них",
    materials: "усиленный каркас, водосток, снеговые упоры по необходимости",
  },
];

const cities = [
  "Симферополь",
  "Севастополь",
  "Ялта",
  "Евпатория",
  "Керчь",
  "Феодосия",
  "Алушта",
];

function isAutoCanopyCase(title: string, description?: string | null) {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  return text.includes("авто") || text.includes("машин") || text.includes("парков");
}

export default async function AutoCanopyCrimeaPage() {
  const content = await getManagedContent();
  const autoCases = content.cases.filter((item) =>
    isAutoCanopyCase(item.title, item.description),
  );
  const visibleCases = (autoCases.length ? autoCases : content.cases).slice(0, 3);

  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: "Главная", url: "/" },
          { name: "Навес для авто в Крыму под ключ", url: path },
        ]}
      />
      <section className="bg-steel-900 py-16 text-white md:py-24">
        <div className="container grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge className="border-border/40 bg-card/10 text-copper-400">
              Автонавесы под ключ
            </Badge>
            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">
              Навес для авто в Крыму под ключ
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/70">
              Проектируем, производим и монтируем металлические навесы для
              автомобилей с учетом крымского солнца, ветра, соли и особенностей
              участка.
            </p>
            <div className="mt-7 grid gap-3">
              {[
                "индивидуальный размер под один или два автомобиля",
                "кровля из поликарбоната, профнастила или металлочерепицы",
                "замер, смета, производство, монтаж и гарантия в одном договоре",
              ].map((point) => (
                <div key={point} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-copper-400" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
            <Button asChild className="mt-8" size="lg" variant="copper">
              <a href="#quiz">Рассчитать стоимость</a>
            </Button>
          </div>
          <Image
            src="/images/canopy-auto.svg"
            alt="Металлический навес для авто в Крыму"
            width={780}
            height={560}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="rounded-[2.5rem] bg-card/10 p-3"
          />
        </div>
      </section>

      <section className="surface-section section-padding">
        <div className="container">
          <Badge>Преимущества</Badge>
          <h2 className="section-title mt-4">Берем автонавес под контроль от замера до гарантии</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((item) => (
              <Card key={item.title} className="h-full p-6">
                <item.icon className="h-8 w-8 text-copper-500" />
                <CardTitle className="mt-4">{item.title}</CardTitle>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <QuizCalculator settings={content.settings} />

      <section className="section-effects section-padding">
        <div className="container relative z-10">
          <Badge>Размеры и материалы</Badge>
          <h2 className="section-title mt-4">Типовые решения для автонавесов</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {sizeOptions.map((item) => (
              <Card key={item.size} className="interactive-card h-full p-6">
                <CardHeader className="p-0">
                  <CardTitle className="text-3xl text-copper-600 dark:text-copper-400">
                    {item.size}
                  </CardTitle>
                </CardHeader>
                <CardContent className="mt-4 p-0">
                  <p className="font-bold">{item.purpose}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.materials}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="cases-section section-effects section-padding">
        <div className="container relative z-10">
          <Badge>Кейсы</Badge>
          <h2 className="section-title mt-4">Автонавесы, которые уже защищают машины клиентов</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {visibleCases.map((item) => (
              <Card key={item.slug ?? item.title} className="interactive-card h-full overflow-hidden">
                <Image
                  src={item.cover_image || "/images/case-1.svg"}
                  alt={item.title}
                  width={520}
                  height={330}
                  loading="lazy"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="h-52 w-full object-cover"
                />
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {item.city ? (
                    <p className="text-sm font-bold text-copper-600 dark:text-copper-400">
                      {item.city}
                    </p>
                  ) : null}
                  {item.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  ) : null}
                  {item.materials?.length ? (
                    <p className="mt-2 font-black text-copper-600 dark:text-copper-400">
                      {item.materials.join(" · ")}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="surface-section section-padding">
        <div className="container grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <Badge>География</Badge>
            <h2 className="section-title mt-4">Монтируем навесы для авто по всему Крыму</h2>
            <p className="section-lead">
              Организуем замер, доставку металлокаркаса и монтажную бригаду в
              крупные города и ближайшие поселки.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {cities.map((city) => (
              <div key={city} className="flex items-center gap-3 rounded-2xl border bg-card p-4 font-bold">
                <MapPin className="h-5 w-5 text-copper-500" />
                {city}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="section-effects section-padding">
        <div className="container relative z-10 grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Badge>Заявка и контакты</Badge>
            <h2 className="section-title mt-4">Получите расчет автонавеса под ваш участок</h2>
            <p className="section-lead">
              Оставьте телефон, размеры площадки или фото заезда — подскажем
              оптимальную форму, материал и ориентировочную стоимость.
            </p>
            <div className="mt-6 grid gap-3 text-sm text-muted-foreground">
              {content.settings.phones.map((phone) => (
                <a key={phone.href} href={phone.href} className="font-black text-foreground hover:text-copper-600">
                  {phone.label}
                </a>
              ))}
            </div>
          </div>
          <ContactLeadForm settings={content.settings} />
        </div>
      </section>
    </>
  );
}
