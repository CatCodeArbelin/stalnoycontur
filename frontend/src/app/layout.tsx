import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileCta } from "@/components/mobile-cta";
import { QuickContact } from "@/components/quick-contact";
import { ConstructionBusinessJsonLd, LocalBusinessJsonLd } from "@/components/seo";
import { getPublicSettings } from "@/lib/content-api";
import { createPageMetadata, siteConfig } from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...createPageMetadata({
    path: "/",
    title: "Стальной Контур — навесы под ключ в Крыму",
    description: siteConfig.defaultDescription,
  }),
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const settings = await getPublicSettings();

  return (
    <html lang="ru" className={manrope.variable}>
      <body className="font-sans antialiased">
        <LocalBusinessJsonLd />
        <ConstructionBusinessJsonLd />
        <Header settings={settings} />
        <main>{children}</main>
        <Footer settings={settings} />
        <QuickContact settings={settings} />
        <MobileCta settings={settings} />
      </body>
    </html>
  );
}
