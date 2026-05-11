import { MessageCircle, Phone } from "lucide-react";

import { fallbackSettings, type PublicSettings } from "@/lib/content-api";

export function MobileCta({ settings = fallbackSettings }: { settings?: PublicSettings }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 p-3 shadow-soft backdrop-blur md:hidden">
      <div className="grid grid-cols-2 gap-2">
        <a className="flex items-center justify-center gap-2 rounded-full bg-steel-900 px-4 py-3 text-sm font-black text-white" href={`tel:${settings.phone.replace(/\D/g, "")}`}><Phone className="h-4 w-4" /> Позвонить</a>
        <a className="flex items-center justify-center gap-2 rounded-full bg-copper-500 px-4 py-3 text-sm font-black text-white" href={settings.whatsapp}><MessageCircle className="h-4 w-4" /> WhatsApp</a>
      </div>
    </div>
  );
}
