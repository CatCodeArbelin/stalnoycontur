import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileCta } from "@/components/mobile-cta";
import { QuickContact } from "@/components/quick-contact";
import { ConstructionBusinessJsonLd, LocalBusinessJsonLd } from "@/components/seo";
import { getPublicSettings } from "@/lib/content-api";
import { createPageMetadata, homeSeo } from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = createPageMetadata(homeSeo);

const themeInitScript = `
(function() {
  try {
    var savedTheme = window.localStorage.getItem("stalnoycontur:theme");
    var mode = savedTheme === "light" || savedTheme === "dark" || savedTheme === "system" ? savedTheme : "system";
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var shouldUseDark = mode === "dark" || (mode === "system" && prefersDark);

    document.documentElement.classList.toggle("dark", shouldUseDark);
    document.documentElement.style.colorScheme = shouldUseDark ? "dark" : "light";
  } catch (error) {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const settings = await getPublicSettings();

  return (
    <html lang="ru" className={manrope.variable} data-view-mode="site" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        <LocalBusinessJsonLd settings={settings} />
        <ConstructionBusinessJsonLd settings={settings} />
        <Header settings={settings} />
        <main className="site-main">{children}</main>
        <Footer settings={settings} />
        <QuickContact settings={settings} />
        <MobileCta settings={settings} />
      </body>
    </html>
  );
}
