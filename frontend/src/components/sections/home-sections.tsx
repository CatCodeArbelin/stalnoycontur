import {
  ArrowRight,
  MessageCircle,
  Phone,
  Send,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ContactLeadForm } from "@/components/lead-form";
import { MotionReveal } from "@/components/motion-reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { canopyTypes } from "@/data/site";
import {
  fallbackGalleryItems,
  fallbackPublicCases,
  fallbackSettings,
  type PublicCase,
  type PublicGalleryItem,
  type PublicSettings,
} from "@/lib/content-api";

export function Hero() {
  return (
    <section className="section-effects section-effects-dark dark-panel relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid bg-[length:38px_38px] opacity-40" />
      <div className="container relative z-10 grid min-h-[680px] items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr]">
        <MotionReveal>
          <Badge className="border-white/15 bg-white/10 text-copper-400">
            Производство и монтаж
          </Badge>
          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-7xl">
            Навесы под ключ в Крыму за 7–14 дней
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Делаем металлические навесы под ключ за 7–14 дней: бесплатно замерим
            участок и подготовим расчет стоимости.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" variant="copper">
              <a href="#quiz">
                Рассчитать стоимость <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/15 bg-white/10 text-white hover:border-copper-400/50 hover:bg-white/15"
            >
              <Link href="/cases">Смотреть кейсы</Link>
            </Button>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            {["7–14 дней", "до 7 лет гарантии", "бесплатный замер"].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/15 bg-white/10 p-3 text-sm font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                >
                  {item}
                </div>
              ),
            )}
          </div>
        </MotionReveal>
        <MotionReveal className="relative" delay={0.12} direction="left">
          <div className="glass relative overflow-hidden rounded-[2.5rem] p-4">
            <Image
              src="/images/hero-canopy.svg"
              alt="Металлический навес для автомобиля"
              width={820}
              height={620}
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="h-auto w-full rounded-[2rem]"
            />
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}

export function Types() {
  return (
    <section className="catalog-section section-effects section-padding">
      <div className="container relative z-10">
        <Badge>Каталог</Badge>
        <h2 className="section-title mt-4">Типы навесов</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {canopyTypes.map((item, index) => (
            <MotionReveal
              key={item.href}
              delay={index * 0.07}
              direction={index % 3 === 0 ? "right" : "up"}
            >
              <Link
                href={item.href}
                className="interactive-card group block overflow-hidden rounded-[2rem] text-card-foreground hover:border-copper-500/50 hover:shadow-lg"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={520}
                  height={320}
                  loading="lazy"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-48 w-full object-cover transition-opacity duration-300 group-hover:opacity-95 motion-safe:lg:transition-transform motion-safe:lg:group-hover:scale-[1.02]"
                />
                <div className="flex items-center justify-between p-5 transition-colors group-hover:text-accent">
                  <span className="text-lg font-black">{item.title}</span>
                  <ArrowRight className="h-5 w-5 text-copper-500" />
                </div>
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

export function SolutionsProductionSteps({
  gallery = fallbackGalleryItems,
}: SolutionsProductionStepsProps) {
  const steps = itemsByCategory(gallery, "work_step");
  const visibleSteps = (
    steps.length ? steps : itemsByCategory(fallbackGalleryItems, "work_step")
  ).slice(0, 3);

  return (
    <section className="section-effects section-effects-dark section-padding dark-panel">
      <div className="container relative z-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <MotionReveal direction="right">
          <Badge className="border-white/15 bg-white/10 text-copper-400">
            Как работаем
          </Badge>
          <h2 className="mt-4 text-3xl font-black">Три шага до навеса</h2>
          <p className="mt-4 leading-7 text-white/70">
            Без длинных презентаций: замеряем, фиксируем смету и монтируем навес
            под ключ.
          </p>
        </MotionReveal>
        <MotionReveal delay={0.12} direction="left">
          <div className="grid gap-3 md:grid-cols-3">
            {visibleSteps.map((item, i) => (
              <div
                key={item.id ?? item.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
              >
                <span className="text-copper-400">0{i + 1}</span>
                <b className="mt-2 block">{item.title}</b>
                {item.description ? (
                  <p className="mt-2 text-sm text-white/60">
                    {item.description}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}

type CasesMapReviewsFaqContactsProps = {
  cases?: PublicCase[];
  settings?: PublicSettings;
};

export function CasesMapReviewsFaqContacts({
  cases = fallbackPublicCases,
  settings = fallbackSettings,
}: CasesMapReviewsFaqContactsProps) {
  const primaryPhone = settings.phones?.[0] ?? fallbackSettings.phones[0];
  const telegramHref = settings.telegram || fallbackSettings.telegram;
  const maxHref = settings.max || fallbackSettings.max;
  const avitoHref = settings.avito || fallbackSettings.avito;

  return (
    <>
      <section className="cases-section section-effects section-padding">
        <div className="container relative z-10">
          <Badge>Кейсы</Badge>
          <h2 className="section-title mt-4">Реализованные объекты</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {cases.map((item) => (
              <Card
                key={item.slug ?? item.title}
                className="interactive-card h-full overflow-hidden"
              >
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
      <section id="contacts" className="surface-section section-padding">
        <div className="container grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Badge>Контакты</Badge>
            <h2 className="section-title mt-4">
              Запишитесь на бесплатный замер
            </h2>
            <p className="section-lead">
              Пришлите размеры или фото участка — подготовим предварительный
              расчет в день обращения.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={primaryPhone.href}>
                  <Phone className="h-5 w-5" /> {primaryPhone.label}
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={telegramHref}>
                  <Send className="h-5 w-5" /> Telegram
                </a>
              </Button>
              <Button asChild size="lg" variant="copper">
                <a href={maxHref}>
                  <MessageCircle className="h-5 w-5" /> MAX
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={avitoHref}>
                  <ShoppingBag className="h-5 w-5" /> Avito
                </a>
              </Button>
            </div>
          </div>
          <ContactLeadForm settings={settings} />
        </div>
      </section>
    </>
  );
}
