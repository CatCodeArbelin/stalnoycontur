import { AdminResource } from "@/components/admin/admin-shell";

export default function AdminReviewsPage() {
  return (
    <AdminResource
      title="Отзывы"
      description="CRUD для отзывов с загрузкой изображения клиента или скриншота."
      endpoint="/admin/reviews"
      fields={[
        { key: "author", label: "Автор" },
        { key: "text", label: "Текст", type: "textarea" },
        { key: "image", label: "Изображение", type: "image" },
        { key: "avito_url", label: "Ссылка Avito" },
      ]}
      columns={[
        { key: "id", label: "ID" },
        { key: "author", label: "Автор" },
        { key: "text", label: "Текст" },
        { key: "image", label: "Изображение" },
        { key: "avito_url", label: "Avito" },
      ]}
    />
  );
}
