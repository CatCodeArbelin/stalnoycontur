import { AdminResource } from "@/components/admin/admin-shell";
import { casesResource } from "@/components/admin/resource-configs";

export default function AdminCasesPage() {
  return <AdminResource {...casesResource} />;
}
