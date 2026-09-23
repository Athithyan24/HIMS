import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, avatarUrl, ageFromDob } from "../lib/api";
import { Page, Card, Badge, Button } from "../components/ui";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useAuth } from "../store/auth";
import toast from "react-hot-toast";

export default function Queue() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["queue"], queryFn: async () => (await api.get("/op/queue")).data.visits });

  useEffect(() => {
    const s = io("/", { transports: ["websocket"] });
    s.on("queue:refresh", () => qc.invalidateQueries({ queryKey: ["queue"] }));
    return () => s.close();
  }, [qc]);

  const patch = useMutation({
    mutationFn: ({ id, queueStatus }) => api.patch(`/op/${id}/status`, { queueStatus }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queue"] }),
  });

  const cols = [
    { key: "waiting", label: "In the hall", tone: "amber" },
    { key: "in-consultation", label: "With the doctor", tone: "blue" },
    { key: "completed", label: "Seen", tone: "green" },
  ];

  return (
    <Page>
      <h1 className="font-serif text-4xl">Live OP rail</h1>
      <p className="text-sm text-mute">Moves as soon as a room status changes — no refresh theatre.</p>
      <div className="grid gap-4 lg:grid-cols-3">
        {cols.map((c) => (
          <div key={c.key} className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-mute">{c.label}</p>
            {(data || [])
              .filter((v) => v.queueStatus === c.key)
              .map((v) => (
                <Card key={v._id}>
                  <div className="flex gap-3">
                    <img src={avatarUrl(v.patient?.name)} className="h-10 w-10 rounded-full" alt="" />
                    <div>
                      <p className="font-medium">{v.patient?.name}</p>
                      <p className="text-xs text-mute">
                        {v.opNumber} · #{v.tokenNo} · {v.department?.name}
                      </p>
                      <p className="mt-1 text-sm">{v.reason}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {user.role === "doctor" && c.key === "waiting" && (
                      <Button
                        className="text-xs"
                        onClick={() => patch.mutate({ id: v._id, queueStatus: "in-consultation" })}
                      >
                        Call in
                      </Button>
                    )}
                    {user.role === "doctor" && c.key !== "completed" && (
                      <Link to={`/consult/${v._id}`}>
                        <Button variant="soft">Open room</Button>
                      </Link>
                    )}
                    {user.role === "nurse" && (
                      <Link to={`/patients/${v.patient?._id}`} className="text-sm text-brand">
                        Chart
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        ))}
      </div>
    </Page>
  );
}

export function WalkInRegister() {
  const qc = useQueryClient();
  const { data: depts } = useQuery({ queryKey: ["depts"], queryFn: async () => (await api.get("/departments")).data.departments });
  const { data: docs } = useQuery({
    queryKey: ["docs"],
    queryFn: async () => (await api.get("/auth/users", { params: { role: "doctor" } })).data.users,
    retry: false,
  });
  const docsFallback = useQuery({
    queryKey: ["depts2"],
    queryFn: async () => (await api.get("/departments")).data.departments,
  });

  async function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    try {
      const { data } = await api.post("/patients", {
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        gender: fd.get("gender"),
        bloodGroup: fd.get("bloodGroup"),
        allergies: fd.get("allergies") ? String(fd.get("allergies")).split(",") : [],
      });
      await api.post("/op", {
        patient: data.patient._id,
        department: fd.get("department"),
        doctor: fd.get("doctor"),
        reason: fd.get("reason"),
      });
      toast.success(`${data.patient.mrn} · OP opened`);
      e.target.reset();
      qc.invalidateQueries();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not register");
    }
  }

  return (
    <Page>
      <h1 className="font-serif text-4xl">Walk-in desk</h1>
      <p className="text-sm text-mute">MRN first, then an OP slip. One sitting.</p>
      <Card className="max-w-2xl">
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
          <input name="name" placeholder="Full name" required className="sm:col-span-2" />
          <input name="phone" placeholder="Phone" />
          <input name="email" placeholder="Email (optional login)" />
          <select name="gender" defaultValue="female">
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          <input name="bloodGroup" placeholder="Blood group" />
          <select name="department" required>
            {(depts || []).map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
          <select name="doctor" required>
            {(depts || []).flatMap((d) =>
              d.head ? (
                <option key={d.head._id} value={d.head._id}>
                  Dr. {d.head.name} · {d.name}
                </option>
              ) : null
            )}
          </select>
          <input name="reason" placeholder="Why today?" className="sm:col-span-2" />
          <input name="allergies" placeholder="Allergies, comma separated" className="sm:col-span-2" />
          <Button className="sm:col-span-2">Issue OP</Button>
        </form>
      </Card>
    </Page>
  );
}
