import { requireCurrentUser } from "@/lib/auth"
import { Nav } from "@/components/nav"
import { SignOutButton } from "@/components/sign-out-button"
import { labelize } from "@/lib/format"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireCurrentUser()

  return (
    <div className="flex min-h-screen flex-1">
      <aside className="flex w-56 flex-none flex-col justify-between border-r border-zinc-200 bg-white px-4 py-6">
        <div>
          <div className="px-3 pb-6">
            <p className="text-lg font-semibold text-zinc-900">SMOS</p>
            <p className="text-xs text-zinc-500">Sales Manager OS</p>
          </div>
          <Nav />
        </div>
        <div className="border-t border-zinc-200 px-3 pt-4">
          <p className="text-sm font-medium text-zinc-900">{user.full_name}</p>
          <p className="text-xs text-zinc-500">{labelize(user.role)}</p>
          <div className="mt-2">
            <SignOutButton />
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-zinc-50 px-8 py-8">{children}</main>
    </div>
  )
}
