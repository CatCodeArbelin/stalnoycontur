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

export type CalculatorConfig = {
  canopyOptions: CalculatorCanopyOption[];
  sizeOptions: CalculatorSizeOption[];
  materialOptions: CalculatorMaterialOption[];
  allowCustomSize: boolean;
};

export const fallbackCalculatorConfig: CalculatorConfig = {
  allowCustomSize: false,
  canopyOptions: [
    { label: "Для авто", value: "Навес для авто", multiplier: 1 },
    { label: "К дому / терраса", value: "Навес к дому", multiplier: 1.08 },
    { label: "Односкатный", value: "Односкатный навес", multiplier: 0.95 },
    { label: "Двускатный", value: "Двускатный навес", multiplier: 1.18 },
  ],
  sizeOptions: [
    { label: "3×4 м", value: "3×4 м", area: 12 },
    { label: "4×6 м", value: "4×6 м", area: 24 },
    { label: "6×6 м", value: "6×6 м", area: 36 },
    { label: "6×8 м", value: "6×8 м", area: 48 },
  ],
  materialOptions: [
    { label: "Поликарбонат", value: "Поликарбонат", pricePerMeter: 7600 },
    { label: "Профнастил", value: "Профнастил", pricePerMeter: 6900 },
    { label: "Металлочерепица", value: "Металлочерепица", pricePerMeter: 8400 },
    { label: "Мягкая кровля", value: "Мягкая кровля", pricePerMeter: 9200 },
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

export type ManagedContent = {
  cases: PublicCase[];
  gallery: PublicGalleryItem[];
  settings: PublicSettings;
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

async function fetchPublic<T>(path: string, fallback: T): Promise<T> {
  const apiBase = getSsrApiBase();
  if (!apiBase) {
    return fallback;
  }

  try {
    const response = await fetch(`${apiBase}${path}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) {
      return fallback;
    }
    return (await response.json()) as T;
  } catch {
    return fallback;
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

export async function getManagedContent(): Promise<ManagedContent> {
  const [cases, gallery, settings] = await Promise.all([
    getPublicCases(),
    getPublicGallery(),
    getPublicSettings(),
  ]);

  return { cases, gallery, settings };
}
