import type { PublicSettings } from "@/lib/content-api";
import { siteConfig, absoluteUrl, publicSettingsTelephone } from "@/lib/seo";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type BreadcrumbItem = {
  name: string;
  url: string;
};

type FAQItem = {
  question: string;
  answer: string;
};

type ReviewProps = {
  author: string;
  text: string;
  ratingValue: number;
  itemName?: string;
};

function JsonLd({ data }: { data: JsonValue }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const address = {
  "@type": "PostalAddress",
  addressLocality: "Симферополь",
  addressRegion: "Республика Крым",
  addressCountry: "RU",
};

const geo = {
  "@type": "GeoCoordinates",
  latitude: 44.9521,
  longitude: 34.1024,
};

export function LocalBusinessJsonLd({ settings }: { settings?: PublicSettings }) {
  const telephone = publicSettingsTelephone(settings);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": absoluteUrl("/#local-business"),
        name: siteConfig.name,
        url: absoluteUrl("/"),
        image: absoluteUrl(siteConfig.image),
        telephone,
        priceRange: "₽₽",
        address,
        geo,
        areaServed: ["Симферополь", "Севастополь", "Ялта", "Евпатория", "Алушта", "Феодосия", "Керч", "Крым"],
        sameAs: [siteConfig.telegram, siteConfig.max],
      }}
    />
  );
}

export function ConstructionBusinessJsonLd({ settings }: { settings?: PublicSettings }) {
  const telephone = publicSettingsTelephone(settings);

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "ConstructionBusiness",
        "@id": absoluteUrl("/#construction-business"),
        name: siteConfig.name,
        url: absoluteUrl("/"),
        image: absoluteUrl(siteConfig.image),
        telephone,
        priceRange: "₽₽",
        address,
        geo,
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Крым",
        },
        makesOffer: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Навесы для авто" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Навесы к дому" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Навесы из поликарбоната" } },
        ],
      }}
    />
  );
}

export function FAQPageJsonLd({ items }: { items: FAQItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }}
    />
  );
}

export function BreadcrumbListJsonLd({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.url),
        })),
      }}
    />
  );
}

export function ReviewJsonLd({ author, text, ratingValue, itemName = siteConfig.name }: ReviewProps) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Review",
        itemReviewed: {
          "@type": "LocalBusiness",
          name: itemName,
          url: absoluteUrl("/"),
        },
        author: {
          "@type": "Person",
          name: author,
        },
        reviewBody: text,
        reviewRating: {
          "@type": "Rating",
          ratingValue,
          bestRating: 5,
        },
      }}
    />
  );
}
