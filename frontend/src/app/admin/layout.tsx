import type { Metadata } from "next";
import type { ReactNode } from "react";

import { adminMetadata } from "@/lib/seo";

export const metadata: Metadata = adminMetadata;

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
