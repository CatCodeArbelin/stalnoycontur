import { MessageCircle, Phone } from "lucide-react";

import { phone } from "@/data/site";

export function QuickContact() {
  return (
    <div className="fixed bottom-6 right-6 z-40 hidden flex-col gap-3 md:flex">
      <a className="grid h-14 w-14 place-items-center rounded-full bg-steel-900 text-white shadow-soft" href={`tel:${phone.replace(/\D/g, "")}`} aria-label="Позвонить"><Phone className="h-5 w-5" /></a>
      <a className="grid h-14 w-14 place-items-center rounded-full bg-copper-500 text-white shadow-soft" href="https://wa.me/79780004488" aria-label="Написать в WhatsApp"><MessageCircle className="h-5 w-5" /></a>
    </div>
  );
}
