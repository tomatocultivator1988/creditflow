"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { ErrorMessage } from "@/components/ui-state";
import { PageHeader } from "@/components/page-header";
import { ResponsiveTable } from "@/components/responsive-table";
import { apiRequest } from "@/lib/client-api";
import type { UserDto } from "@/types/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("COLLECTOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function fetchUsers() {
    apiRequest<{ users: UserDto[] }>("/api/admin/users")
      .then((data) => setUsers(data.users))
      .catch((e: Error) => setError(e.message));
  }

  useEffect(() => { fetchUsers(); }, []);

  function openModal() {
    setModalOpen(true);
    setName(""); setEmail(""); setPassword(""); setRole("COLLECTOR");
    setError(""); setLoading(false);
  }

  async function handleCreateUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Users" description="Manage system users" />
        <button onClick={openModal} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-800 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98]">
          <Plus size={16} /> Add User
        </button>
      </div>

      {error ? <ErrorMessage message={error} /> : null}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <ResponsiveTable<UserDto>
          columns={[
            {
              key: "name",
              label: "Name",
              render: (u) => <span className="font-medium text-slate-900">{u.name}</span>,
            },
            {
              key: "email",
              label: "Email",
              render: (u) => <span className="text-slate-600">{u.email}</span>,
            },
            {
              key: "role",
              label: "Role",
              render: (u) => (
                <span className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ${u.role === "ADMIN" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {u.role}
                </span>
              ),
            },
            {
              key: "created",
              label: "Created",
              hide: "sm",
              render: (u) => <span className="text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>,
            },
          ]}
          data={users}
          emptyMessage="No users"
        />
      </div>

      {/* Add User Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Add User</h2>
                <p className="mt-0.5 text-sm text-slate-500">Create a new system user</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form id="add-user-form" onSubmit={handleCreateUser} className="flex-1 overflow-y-auto space-y-4 px-6 py-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password<input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Role<select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1.5 h-10 w-full rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100"><option value="COLLECTOR">COLLECTOR</option><option value="ADMIN">ADMIN</option></select></label>
              </div>
            </form>
            <div className="flex-shrink-0 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button type="button" onClick={() => setModalOpen(false)} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-xl border border-slate-300 px-6 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">Cancel</button>
              <button type="submit" form="add-user-form" disabled={loading} className="min-h-[44px] sm:min-h-0 w-full sm:w-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-800 px-6 text-sm font-medium text-white shadow-sm hover:bg-red-700 active:scale-[0.98] disabled:bg-slate-300">{loading ? "Creating..." : "Add User"}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
