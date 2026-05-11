import { MessageCircle, Phone, Send } from "lucide-react";

import { contacts } from "@/data/site";
import { fallbackSettings, type PublicSettings } from "@/lib/content-api";

export function QuickContact({ settings = fallbackSettings }: { settings?: PublicSettings }) {
  const primaryPhone = settings.phones?.[0] ?? fallbackSettings.phones[0];
  const telegramHref = settings.telegram || contacts.telegram.href;
  const maxHref = settings.max || contacts.max.href;

  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col gap-3 md:flex">
      <a className="grid h-14 w-14 place-items-center rounded-full bg-steel-900 text-white shadow-soft" href={primaryPhone.href} aria-label={`Позвонить: ${primaryPhone.label}`}><Phone className="h-5 w-5" /></a>
      <a className="grid h-14 w-14 place-items-center rounded-full bg-sky-500 text-white shadow-soft" href={telegramHref} aria-label="Написать в Telegram"><Send className="h-5 w-5" /></a>
      <a className="grid h-14 w-14 place-items-center rounded-full bg-copper-500 text-white shadow-soft" href={maxHref} aria-label="Написать в MAX"><MessageCircle className="h-5 w-5" /></a>
    </div>
  );
}
