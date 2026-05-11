import { AdminResource } from "@/components/admin/admin-shell";

export default function AdminLeadsPage() {
  return (
    <AdminResource
      title="Заявки"
      description="Список заявок с именем, телефоном, городом, типом навеса, материалом, размером, комментарием, страницей, UTM, статусом Telegram-уведомления и датой создания."
      endpoint="/admin/leads"
      fields={[
        { key: "name", label: "Имя" },
        { key: "phone", label: "Телефон" },
        { key: "city", label: "Город" },
        { key: "canopy_type", label: "Тип навеса" },
        { key: "material", label: "Материал" },
        { key: "size", label: "Размер" },
        { key: "comment", label: "Комментарий", type: "textarea" },
        { key: "source_page", label: "Страница" },
        { key: "utm", label: "UTM JSON", type: "json", placeholder: '{"utm_source":"yandex"}' },
      ]}
      columns={[
        { key: "created_at", label: "Дата", format: "dateTime" },
        { key: "name", label: "Имя" },
        { key: "phone", label: "Телефон" },
        { key: "city", label: "Город" },
        { key: "canopy_type", label: "Тип навеса" },
        { key: "material", label: "Материал" },
        { key: "size", label: "Размер" },
        { key: "comment", label: "Комментарий" },
        { key: "source_page", label: "Страница" },
        { key: "utm", label: "UTM" },
        { key: "telegram_status", label: "Telegram", format: "telegramStatus" },
      ]}
    />
  );
}
