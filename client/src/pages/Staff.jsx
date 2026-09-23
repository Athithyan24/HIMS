import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, avatarUrl } from "../lib/api";
import { Page, Card, Button, Field, Badge } from "../components/ui";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Staff() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["users"], queryFn: async () => (await api.get("/auth/users")).data.users });
  const { data: depts } = useQuery({ queryKey: ["depts"], queryFn: async () => (await api.get("/departments")).data.departments });
  const [form, setForm] = useState({ name: "", email: "", password: "Elara@2026", role: "doctor", department: "" });
  const create = useMutation({
    mutationFn: () => api.post("/auth/staff", form),
    onSuccess: () => {
      toast.success("Badge issued");
      qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not create"),
  });

  return (
    <Page>
      <h1 className="font-serif text-4xl">People with keys</h1>
      <p className="text-sm text-mute">Admin creates doctors, nurses, pharmacy and billing — never a clinical chart.</p>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            <Field label="Name">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </Field>
            <Field label="Email">
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </Field>
            <Field label="Role">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacy">Pharmacy</option>
                <option value="billing">Billing</option>
              </select>
            </Field>
            <Field label="Department">
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">—</option>
                {(depts || []).map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Button>Create staff</Button>
          </form>
        </Card>
        <div className="space-y-2 lg:col-span-3">
          {(data || [])
            .filter((u) => u.role !== "patient")
            .map((u) => (
              <Card key={u._id} className="flex items-center gap-3">
                <img src={avatarUrl(u.avatarSeed || u.name)} className="h-10 w-10 rounded-full" alt="" />
                <div className="flex-1">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-mute">{u.email}</p>
                </div>
                <Badge tone="blue">{u.role}</Badge>
              </Card>
            ))}
        </div>
      </div>
    </Page>
  );
}
