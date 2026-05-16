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

export const faqResource: AdminResourceConfig = {
  title: "FAQ",
  description:
    "CRUD для вопросов и ответов с сортировкой и признаком активности.",
  endpoint: "/admin/faq",
  fields: [
    { key: "question", label: "Вопрос" },
    { key: "answer", label: "Ответ", type: "textarea" },
    { key: "sort_order", label: "Порядок", type: "number" },
    { key: "is_active", label: "Активен", type: "checkbox", defaultValue: true },
  ],
  columns: [
    { key: "id", label: "ID" },
    { key: "question", label: "Вопрос" },
    { key: "answer", label: "Ответ" },
    { key: "sort_order", label: "Порядок" },
    { key: "is_active", label: "Активен" },
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
