import { AdminResource } from "@/components/admin/admin-shell";

export default function AdminCasesPage() {
  return (
    <AdminResource
      title="Кейсы"
      description="CRUD для выполненных работ, обложек и галерей изображений. Для галереи укажите JSON-массив URL или список URL с новой строки."
      endpoint="/admin/cases"
      fields={[
        { key: "title", label: "Название" },
        { key: "slug", label: "Slug" },
        { key: "city", label: "Город" },
        { key: "description", label: "Описание", type: "textarea" },
        { key: "materials", label: "Материалы JSON/строки", type: "json" },
        { key: "cover_image", label: "Обложка", type: "image" },
        { key: "gallery", label: "Галерея JSON/строки", type: "image-list" },
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
