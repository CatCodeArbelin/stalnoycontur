import { AdminResource } from "@/components/admin/admin-shell";
import { galleryResource } from "@/components/admin/resource-configs";

export default function AdminGalleryPage() {
  return <AdminResource {...galleryResource} />;
}
