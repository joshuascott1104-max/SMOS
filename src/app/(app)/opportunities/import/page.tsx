import { requireCurrentUser } from "@/lib/auth"
import { PageHeader, Card } from "@/components/ui"
import { Top10ImportForm } from "./import-form"

export default async function Top10ImportPage() {
  const user = await requireCurrentUser()
  const canImport = user.role === "sales_manager" || user.role === "admin"

  return (
    <div>
      <PageHeader
        title="Bulk Import Weekly Top 10"
        subtitle="Upload each BDM's weekly Top 10 in one go, instead of entering opportunities one by one."
      />

      {!canImport ? (
        <Card>
          <p className="text-sm text-zinc-600">
            Only Sales Managers and Admins can bulk import the Weekly Top 10. You can still view and update next
            actions on opportunities from your Rep Workspace.
          </p>
        </Card>
      ) : (
        <Card>
          <Top10ImportForm />
        </Card>
      )}
    </div>
  )
}
