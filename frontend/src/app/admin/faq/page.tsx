import { AdminResource } from "@/components/admin/admin-shell";
import { faqResource } from "@/components/admin/resource-configs";

export default function AdminFaqPage() {
  return <AdminResource {...faqResource} />;
}
