import type { AdminResourceConfig } from "@/components/admin/admin-shell";

export const casesResource: AdminResourceConfig = {
  title: "Кейсы",
  description:
    "CRUD для выполненных работ, обложек и галерей изображений. Для материалов и галереи укажите JSON-массив строк или список значений с новой строки.",
  endpoint: "/admin/cases",
  fields: [
    { key: "title", label: "Название" },
    { key: "slug", label: "Slug" },
    { key: "city", label: "Город" },
    { key: "description", label: "Описание", type: "textarea" },
    { key: "materials", label: "Материалы списком", type: "string-list" },
    {
      key: "cover_image",
      label: "Обложка",
      type: "image",
      uploadCategory: "cases",
    },
    {
      key: "gallery",
      label: "Галерея JSON/строки",
      type: "image-list",
      uploadCategory: "gallery",
    },
  ],
  columns: [
    { key: "id", label: "ID" },
    { key: "title", label: "Название" },
    { key: "slug", label: "Slug" },
    { key: "city", label: "Город" },
    { key: "cover_image", label: "Обложка" },
    { key: "gallery", label: "Галерея" },
  ],
};

export const galleryResource: AdminResourceConfig = {
  title: "Галерея / работы",
  description:
    "Управляемые элементы для публичных блоков. Категории: popular_solution — популярные решения, production — производство, work_step — этапы работ, gallery — галерея.",
  endpoint: "/admin/gallery",
  fields: [
    { key: "title", label: "Название" },
    { key: "description", label: "Описание", type: "textarea" },
    {
      key: "category",
      label: "Категория",
      placeholder: "popular_solution, production, work_step или gallery",
    },
    {
      key: "image",
      label: "Изображение",
      type: "image",
      uploadCategory: "gallery",
    },
    { key: "sort_order", label: "Порядок", type: "number" },
    { key: "is_active", label: "Активен", type: "checkbox", defaultValue: true },
  ],
  columns: [
    { key: "id", label: "ID" },
    { key: "title", label: "Название" },
    { key: "category", label: "Категория" },
    { key: "image", label: "Изображение" },
    { key: "sort_order", label: "Порядок" },
    { key: "is_active", label: "Активен" },
  ],
};


export const landingPagesResource: AdminResourceConfig = {
  title: "Лендинги",
  description:
    "CRUD для SEO и текстового контента посадочных страниц. Адрес страницы — это часть ссылки без домена, например naves-dlya-avto-v-krymu, а итоговая ссылка будет вида https://домен/naves-dlya-avto-v-krymu.",
  endpoint: "/admin/landing-pages",
  fields: [
    {
      key: "slug",
      label: "Адрес страницы",
      placeholder: "naves-dlya-avto-v-krymu",
    },
    { key: "title", label: "Внутреннее название страницы" },
    { key: "meta_title", label: "SEO-заголовок для поисковика" },
    {
      key: "meta_description",
      label: "SEO-описание для поисковика",
      type: "textarea",
    },
    { key: "hero_badge", label: "Маленькая плашка над заголовком" },
    { key: "hero_title", label: "Главный заголовок страницы" },
    {
      key: "hero_description",
      label: "Текст под главным заголовком",
      type: "textarea",
    },
    {
      key: "points",
      label: "Преимущества в первом экране",
      type: "string-list",
    },
    {
      key: "sections",
      label: "Дополнительные блоки страницы",
      type: "json",
      defaultValue: "[]",
      description:
        "Можно использовать ключи benefits, sizes, cases, geo, contacts.",
      placeholder:
        '[{"key":"benefits","title":"Почему выбирают нас","items":["Собственное производство","Монтаж по Крыму"]}]',
    },
    {
      key: "is_published",
      label: "Опубликован",
      type: "checkbox",
      defaultValue: false,
      description:
        "Включите, чтобы страница стала доступна посетителям сайта.",
    },
  ],
  columns: [
    { key: "id", label: "ID" },
    { key: "slug", label: "Адрес страницы" },
    { key: "title", label: "Внутреннее название страницы" },
    { key: "hero_title", label: "Главный заголовок страницы" },
    { key: "is_published", label: "Опубликован" },
    { key: "updated_at", label: "Обновлен", format: "dateTime" },
  ],
};
