import { AdminResource } from "@/components/admin/admin-shell";

export default function AdminFaqPage() {
  return (
    <AdminResource
      title="FAQ"
      description="CRUD для вопросов и ответов с сортировкой и признаком активности."
      endpoint="/admin/faq"
      fields={[
        { key: "question", label: "Вопрос" },
        { key: "answer", label: "Ответ", type: "textarea" },
        { key: "sort_order", label: "Порядок", type: "number" },
        { key: "is_active", label: "Активен", type: "checkbox" },
      ]}
      columns={[
        { key: "id", label: "ID" },
        { key: "question", label: "Вопрос" },
        { key: "answer", label: "Ответ" },
        { key: "sort_order", label: "Порядок" },
        { key: "is_active", label: "Активен" },
      ]}
    />
  );
}
