import { redirect } from "next/navigation"
import { AdminAuth } from "@/lib/auth/admin-auth"
import SourcesDashboard from "@/components/sources-dashboard"

export default async function SourcesPage() {
  const isAdmin = await AdminAuth.isAdmin()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  return <SourcesDashboard />
}
