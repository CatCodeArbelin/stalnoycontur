# Frontend — Стальной Контур

Next.js 15 приложение с App Router, TypeScript, Tailwind CSS, компонентами в стиле shadcn/ui и Framer Motion.

## Команды

```bash
npm install
npm run dev
npm run build
npm run typecheck
```

## Страницы

- `/`
- `/cases`
- `/navesy-dlya-avto`
- `/odnoskatnye-navesy`
- `/dvuskatnye-navesy`
- `/navesy-iz-polikarbonata`
- `/navesy-iz-profnastila`
- `/navesy-k-domu`
- `/simferopol`, `/sevastopol`, `/yalta`, `/evpatoriya`, `/alushta`, `/feodosiya`, `/kerch`

## SEO

SEO реализован штатным Next.js App Router Metadata API, без `next-seo`: это сохраняет серверную генерацию метаданных рядом с `app`-route сегментами и не дублирует `<head>` через клиентские компоненты.

- Общие defaults находятся в `src/lib/seo.ts` (`seoDefaults`) и подключаются через `createPageMetadata` в корневом `src/app/layout.tsx`.
- Публичные страницы в `src/app/**/page.tsx` получают уникальные `title`, `description`, canonical, Open Graph и Twitter metadata через `metadataForPath`.
- `src/app/sitemap.ts` и `src/app/robots.ts` используют единый список публичных SEO-страниц `pagesSeo`, чтобы карта сайта и robots оставались синхронизированы с метаданными.
- JSON-LD разметка вынесена в `src/components/seo/json-ld.tsx` и используется на публичных страницах как серверные компоненты.
- Административные маршруты закрыты от индексации через metadata в `src/app/admin/layout.tsx`.

`next-seo` намеренно не добавлен в зависимости: для текущей архитектуры проекта source of truth для SEO — Next.js Metadata API и route handlers `sitemap.ts` / `robots.ts`.
