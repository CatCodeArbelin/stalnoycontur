import Link from "next/link";

import { canopyTypes, contacts } from "@/data/site";
import { fallbackSettings, type PublicSettings } from "@/lib/content-api";

export function Footer({ settings = fallbackSettings }: { settings?: PublicSettings }) {
  return (
    <footer className="bg-steel-900 pb-24 pt-12 text-white md:pb-10">
      <div className="container grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="text-2xl font-black">{settings.company_name}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">Металлические навесы, козырьки, террасы и парковки под ключ по всему Крыму.</p>
          <div className="mt-5 grid gap-2">{contacts.phones.map((phone) => <a key={phone.href} className="text-xl font-black" href={phone.href}>{phone.label}</a>)}</div>
        </div>
        <div>
          <p className="font-black">Типы навесов</p>
          <div className="mt-3 grid gap-2 text-sm text-white/70">
            {canopyTypes.map((item) => <Link key={item.href} href={item.href}>{item.title}</Link>)}
          </div>
        </div>
        <div>
          <p className="font-black">Города</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/70">
            {settings.cities.map((city) => <span key={city}>{city}</span>)}
          </div>
        </div>
      </div>
    </footer>
  );
}
