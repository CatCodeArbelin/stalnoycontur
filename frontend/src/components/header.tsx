"use client";

import {
  ChevronDown,
  Menu,
  MessageCircle,
  Phone,
  Send,
  ShoppingBag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { nav } from "@/data/site";
import { fallbackSettings, type PublicSettings } from "@/lib/content-api";
import { cn } from "@/lib/utils";

export function Header({
  settings = fallbackSettings,
}: {
  settings?: PublicSettings;
}) {
  const [open, setOpen] = useState(false);
  const phones = settings.phones?.length
    ? settings.phones
    : fallbackSettings.phones;
  const primaryPhone = phones[0];
  const telegramHref = settings.telegram || fallbackSettings.telegram;
  const maxHref = settings.max || fallbackSettings.max;
  const avitoHref = settings.avito || fallbackSettings.avito;

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-card/85 backdrop-blur-xl">
      <div className="container flex h-20 min-w-0 items-center justify-between gap-3 py-3 xl:gap-4">
        <div className="flex min-w-0 flex-1 items-center xl:-ml-2 2xl:-ml-3">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3"
            aria-label={settings.company_name}
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-steel-900 text-lg font-black text-white">
              СК
            </span>
            <span className="min-w-0 max-w-[10rem] leading-tight 2xl:max-w-[14rem]">
              <span className="block truncate text-base font-black uppercase tracking-wide text-foreground">
                {settings.company_name}
              </span>
              <span className="hidden truncate text-xs font-semibold text-muted-foreground 2xl:block">
                навесы под ключ в Крыму
              </span>
            </span>
          </Link>
        </div>

        <nav
          className="hidden shrink-0 items-center gap-1 xl:flex"
          aria-label="Основная навигация"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground 2xl:px-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden min-w-0 shrink-0 items-center justify-end gap-2 xl:flex 2xl:gap-3">
          {primaryPhone ? (
            <a
              href={primaryPhone.href}
              className="hidden max-w-40 truncate rounded-full px-3 py-2 text-sm font-black text-foreground transition hover:bg-muted hover:text-copper-500 2xl:inline-block"
              aria-label={`Позвонить: ${primaryPhone.label}`}
            >
              {primaryPhone.label}
            </a>
          ) : null}

          <details className="group relative hidden 2xl:block">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full px-3 py-2 text-sm font-black text-foreground transition hover:bg-muted hover:text-copper-500 [&::-webkit-details-marker]:hidden">
              Контакты
              <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
            </summary>
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card p-2 text-card-foreground shadow-card">
              {phones.map((phone) => (
                <a
                  key={phone.href}
                  href={phone.href}
                  className="block truncate rounded-xl px-3 py-2 text-sm font-black transition hover:bg-muted hover:text-copper-500"
                >
                  {phone.label}
                </a>
              ))}
              <a
                href={telegramHref}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition hover:bg-muted hover:text-copper-500"
                aria-label="Написать в Telegram"
              >
                <Send className="h-4 w-4 shrink-0" />
                <span className="truncate">Telegram</span>
              </a>
              <a
                href={maxHref}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition hover:bg-muted hover:text-copper-500"
                aria-label="Написать в MAX"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">MAX</span>
              </a>
              <a
                href={avitoHref}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-black transition hover:bg-muted hover:text-copper-500"
                aria-label="Открыть профиль на Avito"
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span className="truncate">Avito</span>
              </a>
            </div>
          </details>

          <a
            href={telegramHref}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-muted hover:text-copper-500 2xl:hidden"
            aria-label="Написать в Telegram"
          >
            <Send className="h-4 w-4" />
          </a>
          <a
            href={maxHref}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-muted hover:text-copper-500 2xl:hidden"
            aria-label="Написать в MAX"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href={avitoHref}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition hover:bg-muted hover:text-copper-500 2xl:hidden"
            aria-label="Открыть профиль на Avito"
          >
            <ShoppingBag className="h-4 w-4" />
          </a>
          <ThemeToggle className="shrink-0" />
          <Button asChild variant="copper" className="shrink-0">
            <a href="#contacts">
              <Phone className="h-4 w-4" />
              Заказать замер
            </a>
          </Button>
        </div>

        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <button
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Открыть меню"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <div
        className={cn(
          "container grid overflow-hidden transition-all xl:hidden",
          open ? "max-h-[38rem] pb-4" : "max-h-0",
        )}
      >
        <div className="rounded-[1.5rem] border border-border bg-card p-3 text-card-foreground shadow-card">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block truncate rounded-2xl px-4 py-3 font-bold text-foreground hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex justify-end">
            <ThemeToggle />
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-4">
            <a
              href={primaryPhone.href}
              onClick={() => setOpen(false)}
              className="flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-steel-900 px-3 py-3 text-sm font-black text-white"
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span className="truncate">Позвонить</span>
            </a>
            <a
              href={telegramHref}
              onClick={() => setOpen(false)}
              className="flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-3 py-3 text-sm font-black text-steel-900"
            >
              <Send className="h-4 w-4 shrink-0" />
              <span className="truncate">Telegram</span>
            </a>
            <a
              href={maxHref}
              onClick={() => setOpen(false)}
              className="flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-copper-500 px-3 py-3 text-sm font-black text-steel-900"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">MAX</span>
            </a>
            <a
              href={avitoHref}
              onClick={() => setOpen(false)}
              className="flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-3 py-3 text-sm font-black text-steel-900"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className="truncate">Avito</span>
            </a>
          </div>
          <Button asChild className="mt-2 w-full" variant="copper">
            <a href="#contacts" onClick={() => setOpen(false)}>
              Получить расчет
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
