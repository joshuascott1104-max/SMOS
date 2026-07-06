import { createClient } from "@/lib/supabase/server"
import { requireCurrentUser } from "@/lib/auth"
import { PageHeader, Card, CardHeading, EmptyState, Badge } from "@/components/ui"
import { labelize } from "@/lib/format"
import { InviteUserForm } from "./invite-user-form"
import { CreateDepotForm } from "./create-depot-form"
import { CreateRepForm } from "./create-rep-form"
import { ChangePasswordForm } from "./change-password-form"
import { UserRowActions } from "./user-row-actions"

export default async function SettingsPage() {
  const currentUser = await requireCurrentUser()
  const supabase = await createClient()

  const [{ data: users }, { data: depots }, { data: reps }] = await Promise.all([
    supabase.from("users").select("*").order("full_name"),
    supabase.from("depots").select("*").order("name"),
    supabase.from("reps").select("*, depots(name)").order("full_name"),
  ])

  const isAdmin = currentUser.role === "admin"

  return (
    <div>
      <PageHeader title="Settings" subtitle="Users, depots and reps." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeading>My account</CardHeading>
          <p className="mb-3 text-sm text-zinc-600">
            {currentUser.full_name} &middot; {currentUser.email}
          </p>
          <ChangePasswordForm />
        </Card>

        <Card>
          <CardHeading count={users?.length ?? 0}>Users</CardHeading>
          {!users || users.length === 0 ? (
            <EmptyState>No users yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {users.map((u) => (
                <li key={u.id} className="py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-zinc-900">{u.full_name}</p>
                      <p className="text-xs text-zinc-500">{u.email} · {labelize(u.role)}</p>
                    </div>
                    <Badge value={u.status} />
                  </div>
                  {isAdmin && (
                    <div className="mt-1">
                      <UserRowActions userId={u.id} status={u.status} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
          {isAdmin ? (
            <div className="mt-4 border-t border-zinc-100 pt-4">
              <InviteUserForm depots={depots ?? []} users={users ?? []} />
            </div>
          ) : (
            <p className="mt-4 border-t border-zinc-100 pt-4 text-xs text-zinc-400">Only admins can invite new users.</p>
          )}
        </Card>

        <Card>
          <CardHeading count={depots?.length ?? 0}>Depots</CardHeading>
          {!depots || depots.length === 0 ? (
            <EmptyState>No depots yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-zinc-100 text-sm">
              {depots.map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-zinc-900">{d.name}</p>
                    <p className="text-xs text-zinc-500">{d.region}</p>
                  </div>
                  <Badge value={d.status} />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 border-t border-zinc-100 pt-4">
            <CreateDepotForm users={users ?? []} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeading count={reps?.length ?? 0}>Reps</CardHeading>
          {!reps || reps.length === 0 ? (
            <EmptyState>No reps yet.</EmptyState>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-zinc-500">
                  <th className="py-1">Rep</th>
                  <th className="py-1">Depot</th>
                  <th className="py-1">Status</th>
                </tr>
              </thead>
              <tbody>
                {reps.map((r) => (
                  <tr key={r.id} className="border-t border-zinc-100">
                    <td className="py-1 font-medium text-zinc-900">{r.full_name}</td>
                    <td className="py-1 text-zinc-600">{r.depots?.name}</td>
                    <td className="py-1">
                      <Badge value={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-4 border-t border-zinc-100 pt-4">
            <CreateRepForm depots={depots ?? []} />
          </div>
        </Card>
      </div>
    </div>
  )
}
