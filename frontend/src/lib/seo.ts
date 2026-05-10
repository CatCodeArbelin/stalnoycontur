import type { Metadata } from "next";

import { cityContent, pageContent } from "@/data/site";

export const siteConfig = {
  name: "Стальной Контур",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stalnoy-contur.ru",
  defaultDescription: "Проектирование, производство и монтаж металлических навесов для авто, дома и бизнеса по всему Крыму.",
  phone: "+7 978 000-44-88",
  whatsapp: "https://wa.me/79780004488",
  locale: "ru_RU",
  image: "/images/hero-canopy.svg",
};

export type PageSeo = {
  path: string;
  title: string;
  description: string;
  image?: string;
};

const serviceSeo: PageSeo[] = Object.entries(pageContent).map(([slug, content]) => ({
  path: `/${slug}`,
  title: `${content.title} — ${siteConfig.name}`,
  description: content.description,
}));

const citySeo: PageSeo[] = Object.entries(cityContent).map(([slug, content]) => ({
  path: `/${slug}`,
  title: `${content.title} под ключ — ${siteConfig.name}`,
  description: content.description,
}));

export const pagesSeo: PageSeo[] = [
  {
    path: "/",
    title: "Стальной Контур — навесы под ключ в Крыму",
    description: siteConfig.defaultDescription,
  },
  {
    path: "/cases",
    title: "Кейсы навесов в Крыму — Стальной Контур",
    description: "Реализованные навесы для авто, дворов, террас и бизнеса в городах Крыма с примерами конструкций и кровли.",
    image: "/images/case-1.svg",
  },
  ...serviceSeo,
  ...citySeo,
];

export const pagesByPath = pagesSeo.reduce<Record<string, PageSeo>>((acc, page) => {
  acc[page.path] = page;
  return acc;
}, {});

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

export function createPageMetadata(page: PageSeo): Metadata {
  const canonical = absoluteUrl(page.path);
  const image = absoluteUrl(page.image || siteConfig.image);

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [image],
    },
  };
}

export function metadataForPath(path: string) {
  return createPageMetadata(pagesByPath[path]);
}
