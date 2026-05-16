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
    "CRUD для SEO и текстового контента посадочных страниц. Points — список строк, sections — JSON-массив или объект с ключами секций (benefits, sizes, cases, geo, contacts).",
  endpoint: "/admin/landing-pages",
  fields: [
    { key: "slug", label: "Slug", placeholder: "naves-dlya-avto-v-krymu" },
    { key: "title", label: "Название" },
    { key: "meta_title", label: "Meta title" },
    { key: "meta_description", label: "Meta description", type: "textarea" },
    { key: "hero_badge", label: "Hero badge" },
    { key: "hero_title", label: "Hero title" },
    { key: "hero_description", label: "Hero description", type: "textarea" },
    { key: "points", label: "Hero points", type: "string-list" },
    {
      key: "sections",
      label: "Sections JSON",
      type: "json",
      defaultValue: "[]",
      placeholder:
        '[{"key":"geo","title":"Монтируем по всему Крыму","description":"Описание блока"}]',
    },
    {
      key: "is_published",
      label: "Опубликован",
      type: "checkbox",
      defaultValue: false,
    },
  ],
  columns: [
    { key: "id", label: "ID" },
    { key: "slug", label: "Slug" },
    { key: "title", label: "Название" },
    { key: "hero_title", label: "Hero title" },
    { key: "is_published", label: "Опубликован" },
    { key: "updated_at", label: "Обновлен", format: "dateTime" },
  ],
};
