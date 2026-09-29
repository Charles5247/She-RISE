import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
export default async function DemoLayout({ children }: { children: React.ReactNode }) {
  if (!await getSessionUser()) redirect(process.env.NEXT_PUBLIC_APP_SURFACE === "admin" ? "/admin/login" : "/login");
  return children;
}
