import { AdminResource } from "@/components/admin/admin-shell";

export default function AdminSettingsPage() {
  return (
    <AdminResource
      title="Настройки"
      description="CRUD для системных и публичных настроек. Значение можно вводить как JSON."
      endpoint="/admin/settings"
      fields={[
        { key: "key", label: "Ключ" },
        { key: "value", label: "Значение JSON", type: "json" },
        { key: "description", label: "Описание", type: "textarea" },
      ]}
      columns={[
        { key: "id", label: "ID" },
        { key: "key", label: "Ключ" },
        { key: "value", label: "Значение" },
        { key: "description", label: "Описание" },
        { key: "updated_at", label: "Обновлено", render: (value) => (value ? new Date(String(value)).toLocaleString("ru-RU") : "—") },
      ]}
    />
  );
}
