import { MessageCircle, Phone, Send } from "lucide-react";

import { fallbackSettings, type PublicSettings } from "@/lib/content-api";

export function MobileCta({ settings = fallbackSettings }: { settings?: PublicSettings }) {
  const primaryPhone = settings.phones?.[0] ?? fallbackSettings.phones[0];
  const telegramHref = settings.telegram || fallbackSettings.telegram;
  const maxHref = settings.max || fallbackSettings.max;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-soft backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
        <a className="flex items-center justify-center gap-1.5 rounded-full bg-steel-900 px-2.5 py-2 text-xs font-black text-white" href={primaryPhone.href}><Phone className="h-4 w-4" /> Позвонить</a>
        <a className="flex items-center justify-center gap-1.5 rounded-full bg-sky-500 px-2.5 py-2 text-xs font-black text-white" href={telegramHref}><Send className="h-4 w-4" /> Telegram</a>
        <a className="flex items-center justify-center gap-1.5 rounded-full bg-copper-500 px-2.5 py-2 text-xs font-black text-white" href={maxHref}><MessageCircle className="h-4 w-4" /> MAX</a>
      </div>
    </div>
  );
}
