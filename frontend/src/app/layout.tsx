import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileCta } from "@/components/mobile-cta";
import { QuickContact } from "@/components/quick-contact";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Стальной Контур — навесы под ключ в Крыму",
  description: "Проектирование, производство и монтаж металлических навесов для авто, дома и бизнеса по всему Крыму.",
  metadataBase: new URL("https://stalnoy-contur.example"),
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ru" className={manrope.variable}>
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <QuickContact />
        <MobileCta />
      </body>
    </html>
  );
}
