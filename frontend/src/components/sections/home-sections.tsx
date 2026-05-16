import { ArrowRight, CheckCircle2, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ContactLeadForm } from "@/components/lead-form";
import { MotionReveal } from "@/components/motion-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { advantages, canopyTypes } from "@/data/site";
import {
  fallbackFaq,
  fallbackGalleryItems,
  fallbackPublicCases,
  fallbackReviews,
  fallbackSettings,
  type PublicCase,
  type PublicFaq,
  type PublicGalleryItem,
  type PublicReview,
  type PublicSettings,
} from "@/lib/content-api";

export function Hero() {
  return (
    <section className="section-effects section-effects-dark dark-panel relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid bg-[length:38px_38px] opacity-40" />
      <div className="container relative z-10 grid min-h-[680px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <MotionReveal>
          <Badge className="border-white/15 bg-white/10 text-copper-400">Производство и монтаж</Badge>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">Навесы под ключ в Крыму за 7–14 дней</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Проектируем, изготавливаем и монтируем металлические навесы для авто, дома, террас и бизнеса. Фиксируем смету, показываем 3D-эскиз и работаем по договору.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="copper"><a href="#quiz">Рассчитать стоимость <ArrowRight className="h-5 w-5" /></a></Button>
            <Button asChild size="lg" variant="outline" className="border-white/15 bg-white/10 text-white hover:border-copper-400/50 hover:bg-white/15"><Link href="/cases">Смотреть кейсы</Link></Button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {["580+ объектов", "до 7 лет гарантии", "0 ₽ за замер"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/15 bg-white/10 p-3 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">{item}</div>
            ))}
          </div>
        </MotionReveal>
        <MotionReveal className="relative" delay={0.12} direction="left">
          <div className="glass relative overflow-hidden rounded-[2.5rem] p-4">
            <Image src="/images/hero-canopy.svg" alt="Металлический навес для автомобиля" width={820} height={620} priority sizes="(min-width: 1024px) 46vw, 100vw" className="h-auto w-full rounded-[2rem]" />
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}

export function Advantages() {
  return (
    <section className="section-effects section-padding">
      <div className="container relative z-10">
        <Badge>Почему мы</Badge>
        <h2 className="section-title mt-4">Инженерный подход вместо типовых решений</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {advantages.map((item) => (
            <Card key={item.title} className="interactive-card h-full p-6">
              <item.icon className="h-9 w-9 text-copper-500" />
              <h3 className="mt-5 text-xl font-black">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Types() {
  return (
    <section className="section-effects section-padding">
      <div className="container relative z-10">
        <Badge>Каталог</Badge>
        <h2 className="section-title mt-4">Типы навесов</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {canopyTypes.map((item, index) => (
            <MotionReveal key={item.href} delay={index * 0.07} direction={index % 3 === 0 ? "right" : "up"}>
              <Link href={item.href} className="interactive-card group block overflow-hidden rounded-[2rem] text-card-foreground">
                <Image src={item.image} alt={item.title} width={520} height={320} loading="lazy" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="h-48 w-full object-cover transition duration-300 motion-safe:sm:group-hover:scale-[1.03]" />
                <div className="flex items-center justify-between p-5 transition-colors group-hover:text-accent"><span className="text-lg font-black">{item.title}</span><ArrowRight className="h-5 w-5 text-copper-500" /></div>
              </Link>
            </MotionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

type SolutionsProductionStepsProps = {
  gallery?: PublicGalleryItem[];
};

function itemsByCategory(items: PublicGalleryItem[], category: string) {
  return items
    .filter((item) => item.category === category)
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

export function SolutionsProductionSteps({ gallery = fallbackGalleryItems }: SolutionsProductionStepsProps) {
  const solutions = itemsByCategory(gallery, "popular_solution");
  const productionItems = itemsByCategory(gallery, "production");
  const steps = itemsByCategory(gallery, "work_step");
  const fallbackProduction = fallbackGalleryItems.find((item) => item.category === "production");
  const visibleSolutions = solutions.length ? solutions : itemsByCategory(fallbackGalleryItems, "popular_solution");
  const production = productionItems[0] ?? fallbackProduction;
  const visibleSteps = steps.length ? steps : itemsByCategory(fallbackGalleryItems, "work_step");

  return (
    <section className="section-effects section-effects-dark section-padding dark-panel">
      <div className="container relative z-10 grid gap-10 lg:grid-cols-3">
        <MotionReveal direction="right">
          <Badge className="border-white/15 bg-white/10 text-copper-400">Популярные решения</Badge>
          <h2 className="mt-4 text-3xl font-black">От идеи до готового навеса</h2>
          <div className="mt-6 grid gap-3">
            {visibleSolutions.map((item) => (
              <div key={item.id ?? item.title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"><CheckCircle2 className="h-5 w-5 text-copper-400" />{item.title}</div>
            ))}
          </div>
        </MotionReveal>
        <MotionReveal delay={0.12} direction="up">
          <h3 className="text-2xl font-black">{production?.title ?? "Производство"}</h3>
          {production?.image ? <Image src={production.image} alt={production.title} width={520} height={320} loading="lazy" sizes="(min-width: 1024px) 33vw, 100vw" className="mt-5 h-40 w-full rounded-[1.5rem] object-cover" /> : null}
          <p className="mt-4 leading-7 text-white/70">{production?.description}</p>
        </MotionReveal>
        <MotionReveal delay={0.18} direction="left">
          <h3 className="text-2xl font-black">Этапы работ</h3>
          <div className="mt-5 grid gap-3">
            {visibleSteps.map((item, i) => (
              <div key={item.id ?? item.title} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"><span className="text-copper-400">0{i + 1}</span> <b>{item.title}</b>{item.description ? <p className="mt-2 text-sm text-white/60">{item.description}</p> : null}</div>
            ))}
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}

type CasesMapReviewsFaqContactsProps = {
  cases?: PublicCase[];
  reviews?: PublicReview[];
  faq?: PublicFaq[];
  settings?: PublicSettings;
};

export function CasesMapReviewsFaqContacts({
  cases = fallbackPublicCases,
  reviews = fallbackReviews,
  faq = fallbackFaq,
  settings = fallbackSettings,
}: CasesMapReviewsFaqContactsProps) {
  const visibleReviews = reviews.slice(0, 6);
  const primaryPhone = settings.phones?.[0] ?? fallbackSettings.phones[0];
  const telegramHref = settings.telegram || fallbackSettings.telegram;
  const maxHref = settings.max || fallbackSettings.max;

  return (
    <>
      <section className="section-effects section-padding"><div className="container relative z-10"><Badge>Кейсы</Badge><h2 className="section-title mt-4">Реализованные объекты</h2><div className="mt-8 grid gap-5 md:grid-cols-3">{cases.map((item) => <Card key={item.slug ?? item.title} className="interactive-card h-full overflow-hidden"><Image src={item.cover_image || "/images/case-1.svg"} alt={item.title} width={520} height={330} loading="lazy" sizes="(min-width: 768px) 33vw, 100vw" className="h-52 w-full object-cover" /><CardHeader><CardTitle>{item.title}</CardTitle></CardHeader><CardContent>{item.city ? <p className="text-sm text-muted-foreground">{item.city}</p> : null}{item.description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p> : null}{item.materials?.length ? <p className="mt-2 font-black text-copper-600 dark:text-copper-400">{item.materials.join(" · ")}</p> : null}</CardContent></Card>)}</div></div></section>
      <section className="surface-section section-padding"><div className="container grid gap-8 lg:grid-cols-2"><div><Badge>География</Badge><h2 className="section-title mt-4">Работаем по всему Крыму</h2><p className="section-lead">Выезжаем на замер в крупные города и поселки. Учитываем ветровой район, соленый воздух и особенности участка.</p><div className="mt-6 flex flex-wrap gap-2">{settings.cities.map((city) => <span key={city} className="rounded-full border border-border/70 bg-muted/80 px-4 py-2 text-sm font-bold shadow-[inset_0_1px_0_hsl(var(--foreground)/0.04)]">{city}</span>)}</div></div><div className="dark-panel rounded-[2rem] p-6"><MapPin className="h-10 w-10 text-copper-400" /><p className="mt-6 text-2xl font-black">Карта Крыма</p><p className="mt-3 text-white/65">Симферополь — центральный склад и производство. Бригады выезжают по всему полуострову.</p></div></div></section>
      <section className="section-padding">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div>
            <Badge>Отзывы</Badge>
            <h2 className="section-title mt-4">Клиенты отмечают аккуратность монтажа</h2>
            {visibleReviews.length ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visibleReviews.map((review) => (
                  <article key={review.id ?? `${review.author}-${review.text}`} className="interactive-card flex h-full flex-col overflow-hidden rounded-[2rem] text-card-foreground">
                    {review.image ? (
                      <Image
                        src={review.image}
                        alt={`Отзыв клиента ${review.author}`}
                        width={520}
                        height={320}
                        loading="lazy"
                        sizes="(min-width: 1280px) 16vw, (min-width: 640px) 25vw, 100vw"
                        className="h-44 w-full object-cover"
                      />
                    ) : null}
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-sm leading-6 text-muted-foreground">«{review.text}»</p>
                      <p className="mt-4 font-black">{review.author}</p>
                      {review.avito_url ? (
                        <Button asChild className="mt-5 self-start" variant="outline">
                          <a href={review.avito_url} target="_blank" rel="noreferrer">Смотреть на Avito</a>
                        </Button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="interactive-card mt-6 rounded-[2rem] p-6 text-card-foreground">
                <p className="font-black">Отзывы скоро появятся</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">Мы уже собираем публичные отзывы клиентов и скоро добавим их на главную.</p>
              </div>
            )}
          </div>
          <div><Badge>FAQ</Badge><div className="mt-6 grid gap-3">{faq.map((item) => <details key={item.id ?? item.question} className="interactive-card rounded-2xl p-5 text-card-foreground"><summary className="cursor-pointer font-black">{item.question}</summary><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p></details>)}</div></div>
        </div>
      </section>
      <section id="contacts" className="surface-section section-padding"><div className="container grid gap-8 lg:grid-cols-[1fr_0.8fr]"><div><Badge>Контакты</Badge><h2 className="section-title mt-4">Запишитесь на бесплатный замер</h2><p className="section-lead">Пришлите размеры или фото участка — подготовим предварительный расчет в день обращения.</p><div className="mt-8 flex flex-wrap gap-3"><Button asChild size="lg"><a href={primaryPhone.href}><Phone className="h-5 w-5" /> {primaryPhone.label}</a></Button><Button asChild size="lg" variant="outline"><a href={telegramHref}><Send className="h-5 w-5" /> Telegram</a></Button><Button asChild size="lg" variant="copper"><a href={maxHref}><MessageCircle className="h-5 w-5" /> MAX</a></Button></div></div><ContactLeadForm settings={settings} /></div></section>
    </>
  );
}
