import { AdminResource } from "@/components/admin/admin-shell";
import { landingPagesResource } from "@/components/admin/resource-configs";

export default function AdminLandingPagesPage() {
  return <AdminResource {...landingPagesResource} />;
}
