import { AdminResource } from "@/components/admin/admin-shell";
import { reviewsResource } from "@/components/admin/resource-configs";

export default function AdminReviewsPage() {
  return <AdminResource {...reviewsResource} />;
}
