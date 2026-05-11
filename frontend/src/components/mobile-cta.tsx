import { MessageCircle, Phone, Send } from "lucide-react";

import { contacts } from "@/data/site";
import { fallbackSettings, type PublicSettings } from "@/lib/content-api";

export function MobileCta({ settings = fallbackSettings }: { settings?: PublicSettings }) {
  const primaryPhone = contacts.phones[0] ?? { href: `tel:${settings.phone.replace(/[^\d+]/g, "")}`, label: settings.phone };
  const telegramHref = settings.telegram || contacts.telegram.href;
  const maxHref = settings.max || contacts.max.href;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 p-3 shadow-soft backdrop-blur md:hidden">
      <div className="grid grid-cols-3 gap-2">
        <a className="flex items-center justify-center gap-2 rounded-full bg-steel-900 px-3 py-3 text-sm font-black text-white" href={primaryPhone.href}><Phone className="h-4 w-4" /> Позвонить</a>
        <a className="flex items-center justify-center gap-2 rounded-full bg-sky-500 px-3 py-3 text-sm font-black text-white" href={telegramHref}><Send className="h-4 w-4" /> Telegram</a>
        <a className="flex items-center justify-center gap-2 rounded-full bg-copper-500 px-3 py-3 text-sm font-black text-white" href={maxHref}><MessageCircle className="h-4 w-4" /> MAX</a>
      </div>
    </div>
  );
}
