import {
  cases as fallbackCases,
  contacts as fallbackContacts,
  phone as fallbackPhone,
} from "@/data/site";

export type PublicCase = {
  id?: number | null;
  title: string;
  slug?: string | null;
  city?: string | null;
  description?: string | null;
  materials?: string[] | null;
  cover_image?: string | null;
  gallery?: string[] | null;
  created_at?: string | null;
};

export type PublicGalleryItem = {
  id?: number | null;
  title: string;
  description?: string | null;
  category: string;
  image?: string | null;
  sort_order?: number | null;
  created_at?: string | null;
};

export type PublicPhone = {
  label: string;
  href: string;
};

export type CalculatorCanopyOption = {
  label: string;
  value: string;
  multiplier: number;
};

export type CalculatorSizeOption = {
  label: string;
  value: string;
  area: number;
};

export type CalculatorMaterialOption = {
  label: string;
  value: string;
  pricePerMeter: number;
};

export type CalculatorStep = {
  id: string;
  title: string;
  source: "canopyOptions" | "materialOptions" | "sizeOptions" | "contacts";
};

export type CalculatorConfig = {
  canopyOptions: CalculatorCanopyOption[];
  sizeOptions: CalculatorSizeOption[];
  materialOptions: CalculatorMaterialOption[];
  steps: CalculatorStep[];
  allowCustomSize: boolean;
};

export const fallbackCalculatorConfig: CalculatorConfig = {
  allowCustomSize: false,
  steps: [
    { id: "canopy", title: "Под что нужен навес?", source: "canopyOptions" },
    {
      id: "material",
      title: "Выберите покрытие крыши",
      source: "materialOptions",
    },
    { id: "size", title: "Выберите примерный размер", source: "sizeOptions" },
    { id: "contacts", title: "Контакты", source: "contacts" },
  ],
  canopyOptions: [
    { label: "Под авто", value: "Под авто", multiplier: 1 },
    { label: "Беседку", value: "Беседку", multiplier: 1.08 },
    { label: "Терасса", value: "Терасса", multiplier: 1.12 },
  ],
  sizeOptions: [
    { label: "3×4 м", value: "3×4 м", area: 12 },
    { label: "4×6 м", value: "4×6 м", area: 24 },
    { label: "6×6 м", value: "6×6 м", area: 36 },
    { label: "6×8 м", value: "6×8 м", area: 48 },
  ],
  materialOptions: [
    { label: "Профнастил", value: "Профнастил", pricePerMeter: 6900 },
    { label: "Мягкая", value: "Мягкая", pricePerMeter: 9200 },
    { label: "Поликарбонат", value: "Поликарбонат", pricePerMeter: 7600 },
    { label: "Монолит", value: "Монолит", pricePerMeter: 9800 },
  ],
};

export type PublicSettings = {
  company_name: string;
  phone: string;
  phones: PublicPhone[];
  telegram?: string;
  max?: string;
  avito?: string;
  personal_data_consent_text: string;
  calculator_config: CalculatorConfig;
};


export type LandingPageSection = {
  key?: string;
  title?: string;
  description?: string;
  items?: unknown[];
  [key: string]: unknown;
};

export type PublicLandingPage = {
  slug: string;
  title: string;
  meta_title?: string | null;
  meta_description?: string | null;
  hero_badge?: string | null;
  hero_title: string;
  hero_description?: string | null;
  points?: string[] | null;
  sections?: LandingPageSection[] | Record<string, LandingPageSection> | null;
};

export type ManagedContent = {
  cases: PublicCase[];
  gallery: PublicGalleryItem[];
  settings: PublicSettings;
};


export const fallbackAutoCanopyLandingPage: PublicLandingPage = {
  slug: "naves-dlya-avto-v-krymu",
  title: "Навес для авто в Крыму под ключ",
  meta_title: "Навес для авто в Крыму под ключ — Стальной Контур",
  meta_description:
    "Закажите навес для авто в Крыму под ключ: проектирование, производство и монтаж в Симферополе, Севастополе, Ялте, Евпатории и других городах. Рассчитайте стоимость сегодня.",
  hero_badge: "Автонавесы под ключ",
  hero_title: "Навес для авто в Крыму под ключ",
  hero_description:
    "Проектируем, производим и монтируем металлические навесы для автомобилей с учетом крымского солнца, ветра, соли и особенностей участка.",
  points: [
    "автонавес под ключ: замер, смета, производство, монтаж и гарантия в одном договоре",
    "металлический навес для машины под размер одного или двух автомобилей",
    "навес для автомобиля из поликарбоната, профнастила или металлочерепицы",
  ],
  sections: [
    {
      key: "benefits",
      title: "Берем автонавес под ключ под контроль от замера до гарантии",
    },
    { key: "sizes", title: "Типовые решения для автонавесов" },
    {
      key: "cases",
      title: "Автонавесы, которые уже защищают машины клиентов",
    },
    {
      key: "geo",
      title: "Монтируем навесы для авто по всему Крыму",
      description:
        "Организуем замер, доставку металлокаркаса и монтажную бригаду в Симферополь, Севастополь, Ялту, Евпаторию, Керчь, Феодосию, Алушту и ближайшие поселки.",
    },
    {
      key: "contacts",
      title: "Получите расчет автонавеса под ваш участок",
      description:
        "Оставьте телефон, размеры площадки или фото заезда — подскажем оптимальную форму, материал и ориентировочную стоимость автонавеса под ключ.",
    },
  ],
};

export const fallbackSettings: PublicSettings = {
  company_name: "Стальной Контур",
  phone: fallbackPhone,
  phones: fallbackContacts.phones,
  telegram: fallbackContacts.telegram.href,
  max: fallbackContacts.max.href,
  avito: fallbackContacts.avito.href,
  personal_data_consent_text:
    "Нажимая кнопку отправки, вы соглашаетесь на обработку персональных данных.",
  calculator_config: fallbackCalculatorConfig,
};

export const fallbackPublicCases: PublicCase[] = fallbackCases.map(
  (item, index) => ({
    id: index + 1,
    title: item.title,
    city: item.place,
    description: item.price,
    cover_image: item.image,
    gallery: [item.image],
  }),
);

export const fallbackGalleryItems: PublicGalleryItem[] = [
  {
    title: "Парковка на 1–2 авто",
    category: "popular_solution",
    sort_order: 10,
  },
  { title: "Терраса у дома", category: "popular_solution", sort_order: 20 },
  { title: "Входная группа", category: "popular_solution", sort_order: 30 },
  { title: "Коммерческий навес", category: "popular_solution", sort_order: 40 },
  {
    title: "Производство",
    description:
      "Режем металл, варим фермы на стапелях, грунтуем и окрашиваем порошковой или атмосферостойкой эмалью. На объект приезжают готовые элементы — монтаж проходит быстро и чисто.",
    category: "production",
    image: "/images/hero-canopy.svg",
    sort_order: 10,
  },
  { title: "Заявка и замер", category: "work_step", sort_order: 10 },
  { title: "Проект и смета", category: "work_step", sort_order: 20 },
  { title: "Производство", category: "work_step", sort_order: 30 },
  { title: "Монтаж и сдача", category: "work_step", sort_order: 40 },
];

function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

function getSsrApiBase() {
  const apiBase =
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    return null;
  }

  const normalizedApiBase = trimTrailingSlashes(apiBase);
  if (normalizedApiBase.startsWith("/")) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) {
      return null;
    }

    return new URL(normalizedApiBase, siteUrl).toString().replace(/\/+$/, "");
  }

  return normalizedApiBase;
}

async function fetchPublic<T>(path: string, fallback: T): Promise<T>;
async function fetchPublic<T>(path: string, fallback?: T): Promise<T | null>;
async function fetchPublic<T>(path: string, fallback?: T): Promise<T | null> {
  const apiBase = getSsrApiBase();
  if (!apiBase) {
    return fallback ?? null;
  }

  try {
    const response = await fetch(`${apiBase}${path}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return fallback ?? null;
    }
    return (await response.json()) as T;
  } catch {
    return fallback ?? null;
  }
}

export async function getPublicCases(): Promise<PublicCase[]> {
  return fetchPublic("/cases", fallbackPublicCases);
}

export async function getPublicGallery(): Promise<PublicGalleryItem[]> {
  return fetchPublic("/gallery", fallbackGalleryItems);
}

export async function getPublicSettings(): Promise<PublicSettings> {
  return fetchPublic("/settings", fallbackSettings);
}


export async function getPublicLandingPage(
  slug: string,
  fallback: PublicLandingPage,
): Promise<PublicLandingPage>;
export async function getPublicLandingPage(
  slug: string,
): Promise<PublicLandingPage | null>;
export async function getPublicLandingPage(
  slug: string,
  fallback?: PublicLandingPage,
): Promise<PublicLandingPage | null> {
  return fallback
    ? fetchPublic(`/content/landing-pages/${encodeURIComponent(slug)}`, fallback)
    : fetchPublic<PublicLandingPage>(`/content/landing-pages/${encodeURIComponent(slug)}`);
}

export async function getManagedContent(): Promise<ManagedContent> {
  const [cases, gallery, settings] = await Promise.all([
    getPublicCases(),
    getPublicGallery(),
    getPublicSettings(),
  ]);

  return { cases, gallery, settings };
}
