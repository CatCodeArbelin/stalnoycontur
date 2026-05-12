"use client";

import { Menu, MessageCircle, Phone, Send, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { nav } from "@/data/site";
import { fallbackSettings, type PublicSettings } from "@/lib/content-api";
import { cn } from "@/lib/utils";

export function Header({ settings = fallbackSettings }: { settings?: PublicSettings }) {
  const [open, setOpen] = useState(false);
  const phones = settings.phones?.length ? settings.phones : fallbackSettings.phones;
  const primaryPhone = phones[0];
  const telegramHref = settings.telegram || fallbackSettings.telegram;
  const maxHref = settings.max || fallbackSettings.max;

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-background/85 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label={settings.company_name}>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-steel-900 text-lg font-black text-white">СК</span>
          <span className="leading-tight">
            <span className="block text-base font-black uppercase tracking-wide text-steel-900">{settings.company_name}</span>
            <span className="text-xs font-semibold text-muted-foreground">навесы под ключ в Крыму</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-4 py-2 text-sm font-bold text-steel-700 transition hover:bg-white hover:text-steel-900">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <div className="hidden flex-col items-end leading-tight xl:flex">
            {phones.map((phone) => (
              <a key={phone.href} href={phone.href} className="text-sm font-black text-steel-900 transition hover:text-copper-600">
                {phone.label}
              </a>
            ))}
          </div>
          <a href={telegramHref} className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-black text-steel-800 transition hover:bg-white hover:text-copper-600 lg:flex" aria-label="Написать в Telegram">
            <Send className="h-4 w-4" />
            Telegram
          </a>
          <a href={maxHref} className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-black text-steel-800 transition hover:bg-white hover:text-copper-600 lg:flex" aria-label="Написать в MAX">
            <MessageCircle className="h-4 w-4" />
            MAX
          </a>
          <Button asChild variant="copper"><a href="#contacts"><Phone className="h-4 w-4" />Заказать замер</a></Button>
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-full border bg-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Открыть меню">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <div className={cn("container grid overflow-hidden transition-all lg:hidden", open ? "max-h-[34rem] pb-4" : "max-h-0")}>
        <div className="rounded-[1.5rem] border bg-white p-3 shadow-card">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 font-bold text-steel-800 hover:bg-muted">
              {item.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-3 gap-2">
            <a href={primaryPhone.href} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-2xl bg-steel-900 px-3 py-3 text-sm font-black text-white">
              <Phone className="h-4 w-4" />
              Позвонить
            </a>
            <a href={telegramHref} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-3 py-3 text-sm font-black text-white">
              <Send className="h-4 w-4" />
              Telegram
            </a>
            <a href={maxHref} onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-2xl bg-copper-500 px-3 py-3 text-sm font-black text-white">
              <MessageCircle className="h-4 w-4" />
              MAX
            </a>
          </div>
          <Button asChild className="mt-2 w-full" variant="copper"><a href="#contacts" onClick={() => setOpen(false)}>Получить расчет</a></Button>
        </div>
      </div>
    </header>
  );
}
