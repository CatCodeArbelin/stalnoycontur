import { AdminResource } from "@/components/admin/admin-shell";

export default function AdminCasesPage() {
  return (
    <AdminResource
      title="Кейсы"
      description="CRUD для выполненных работ, обложек и галерей изображений. Для материалов и галереи укажите JSON-массив строк или список значений с новой строки."
      endpoint="/admin/cases"
      fields={[
        { key: "title", label: "Название" },
        { key: "slug", label: "Slug" },
        { key: "city", label: "Город" },
        { key: "description", label: "Описание", type: "textarea" },
        { key: "materials", label: "Материалы списком", type: "string-list" },
        { key: "cover_image", label: "Обложка", type: "image", uploadCategory: "cases" },
        { key: "gallery", label: "Галерея JSON/строки", type: "image-list", uploadCategory: "gallery" },
      ]}
      columns={[
        { key: "id", label: "ID" },
        { key: "title", label: "Название" },
        { key: "slug", label: "Slug" },
        { key: "city", label: "Город" },
        { key: "cover_image", label: "Обложка" },
        { key: "gallery", label: "Галерея" },
      ]}
    />
  );
}
