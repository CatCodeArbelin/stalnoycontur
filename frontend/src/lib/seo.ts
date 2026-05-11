import type { Metadata } from "next";

import { cityContent, contacts, pageContent } from "@/data/site";

export const siteConfig = {
  name: "Стальной Контур",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stalnoy-contur.ru",
  defaultDescription: "Проектирование, производство и монтаж металлических навесов для авто, дома и бизнеса по всему Крыму.",
  phone: contacts.phones[0].label,
  phones: contacts.phones.map((phone) => phone.label),
  telegram: contacts.telegram.href,
  max: contacts.max.href,
  locale: "ru_RU",
  language: "ru",
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

export const homeSeo: PageSeo = {
  path: "/",
  title: "Стальной Контур — навесы под ключ в Крыму",
  description: siteConfig.defaultDescription,
};

export const pagesSeo: PageSeo[] = [
  homeSeo,
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

export const seoDefaults: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "construction",
  alternates: {
    canonical: absoluteUrl(homeSeo.path),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export function createPageMetadata(page: PageSeo = homeSeo): Metadata {
  const canonical = absoluteUrl(page.path);
  const image = absoluteUrl(page.image || siteConfig.image);

  return {
    ...seoDefaults,
    title: page.title,
    description: page.description,
    alternates: {
      canonical,
    },
    openGraph: {
      ...seoDefaults.openGraph,
      title: page.title,
      description: page.description,
      url: canonical,
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
      ...seoDefaults.twitter,
      title: page.title,
      description: page.description,
      images: [image],
    },
  };
}

export function metadataForPath(path: string) {
  return createPageMetadata(pagesByPath[path] ?? homeSeo);
}

export const adminMetadata: Metadata = {
  ...seoDefaults,
  title: `Администрирование — ${siteConfig.name}`,
  description: "Закрытая административная панель сайта Стальной Контур.",
  alternates: undefined,
  openGraph: undefined,
  twitter: undefined,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};
