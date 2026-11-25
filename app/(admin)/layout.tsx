import { LayoutClient } from "@/components/layouts/LayoutClient";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <LayoutClient>{children}</LayoutClient>;
}
