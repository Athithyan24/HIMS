import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, when } from "../lib/api";
import { Page, Card, Badge, Button, Field } from "../components/ui";
import { useAuth } from "../store/auth";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Appointments() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["appts"], queryFn: async () => (await api.get("/appointments")).data.appointments });
  const { data: depts } = useQuery({ queryKey: ["depts"], queryFn: async () => (await api.get("/departments")).data.departments });
  const { data: docs } = useQuery({ queryKey: ["doctors"], queryFn: async () => (await api.get("/doctors")).data.doctors });
  const { data: patients } = useQuery({
    queryKey: ["pats"],
    queryFn: async () => (await api.get("/patients")).data.patients,
    enabled: user.role !== "patient",
  });
  const [form, setForm] = useState({ department: "", doctor: "", scheduledAt: "", reason: "", patient: "" });

  const create = useMutation({
    mutationFn: () => api.post("/appointments", form),
    onSuccess: () => {
      toast.success("On the diary");
      qc.invalidateQueries({ queryKey: ["appts"] });
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not book"),
  });

  return (
    <Page>
      <h1 className="font-serif text-4xl">{user.role === "patient" ? "Book a doctor" : "Diary"}</h1>
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            {user.role !== "patient" && (
              <Field label="Patient">
                <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
                  <option value="">Select</option>
                  {(patients || []).map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} · {p.mrn}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Department">
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required>
                <option value="">Select</option>
                {(depts || []).map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Doctor">
              <select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required>
                <option value="">Select</option>
                {(docs || [])
                  .filter((d) => !form.department || d.department?._id === form.department)
                  .map((d) => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="When">
              <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
            </Field>
            <Field label="Reason">
              <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </Field>
            <Button>Reserve slot</Button>
          </form>
        </Card>
        <div className="space-y-3 lg:col-span-3">
          {(data || []).map((a) => (
            <Card key={a._id}>
              <div className="flex justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {a.patient?.name} · Dr. {a.doctor?.name}
                  </p>
                  <p className="text-sm text-mute">
                    {a.department?.name} · {when(a.scheduledAt)}
                  </p>
                  <p className="text-sm">{a.reason}</p>
                </div>
                <Badge tone={a.status === "scheduled" ? "blue" : "green"}>{a.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Page>
  );
}
