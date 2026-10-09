import { useQuery } from "@tanstack/react-query";
import { api, money, when, avatarUrl } from "../lib/api";
import { useAuth } from "../store/auth";
import { Page, Card, Badge, Skeleton } from "../components/ui";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Link } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  if (user.role === "admin") return <AdminHome />;
  if (user.role === "doctor") return <DoctorHome />;
  if (user.role === "nurse") return <NurseHome />;
  if (user.role === "pharmacy") return <PharmacyHome />;
  if (user.role === "billing") return <BillingHome />;
  return <PatientHome />;
}

function AdminHome() {
  const k = useQuery({ queryKey: ["dash-admin"], queryFn: async () => (await api.get("/dash/admin")).data.kpis });
  const op = useQuery({ queryKey: ["op-an"], queryFn: async () => (await api.get("/op/analytics")).data });
  const act = useQuery({ queryKey: ["act"], queryFn: async () => (await api.get("/activity")).data.logs });
  const patients = useQuery({ queryKey: ["patients", ""], queryFn: async () => (await api.get("/patients")).data.patients });
  if (k.isLoading) return <Skeleton className="h-64" />;
  const tiles = [
    ["Census", k.data.patients, "People with an open chart"],
    ["Consultants", k.data.doctors, "Across seven floors"],
    ["Taken today", money(k.data.dailyRevenue), "Settled at billing"],
    ["Live OP", k.data.activeOp, "Still on the floor"],
    ["Open invoices", k.data.pendingBills, "Need a collector"],
  ];
  return (
    <Page>
      <Header kicker="Wednesday campus" title="How the building is breathing." />
      <div className="grid gap-4 md:grid-cols-5">
        {tiles.map(([l, v, s]) => (
          <Card key={l} className="md:col-span-1">
            <p className="text-xs uppercase tracking-wide text-mute">{l}</p>
            <p className="mt-3 font-serif text-3xl">{v}</p>
            <p className="mt-2 text-xs text-mute">{s}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <p className="text-sm text-mute">Seven-day OP</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={op.data?.trend || []}>
                <XAxis dataKey="date" hide />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#2563EB" fill="#EFF4FF" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <p className="text-sm text-mute">Recent staff actions</p>
          <ul className="mt-3 space-y-3">
            {(act.data || []).map((l) => (
              <li key={l._id} className="text-sm">
                <span className="font-medium">{l.actor?.name}</span>
                <span className="text-mute"> · {l.action}</span>
              </li>
            ))}
            {!act.data?.length && <p className="text-sm text-mute">Quiet so far.</p>}
          </ul>
        </Card>
      </div>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-mute">Latest charts</p>
            <h2 className="mt-1 font-serif text-2xl">Patient records</h2>
          </div>
          <Link className="text-sm font-medium text-brand" to="/patients">View all patients</Link>
        </div>
        {patients.isError && <p role="alert" className="mt-4 text-sm text-rose-700">Patient records could not be loaded.</p>}
        {patients.isLoading ? (
          <Skeleton className="mt-4 h-20" />
        ) : patients.data?.length ? (
          <div className="mt-4 divide-y divide-line">
            {patients.data.slice(0, 5).map((patient) => (
              <Link key={patient._id} to={`/patients/${patient._id}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <img src={avatarUrl(patient.name)} className="h-10 w-10 rounded-full bg-brand-soft" alt="" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{patient.name}</p>
                  <p className="text-xs text-mute">{patient.mrn} · {patient.phone || patient.email || "No contact details"}</p>
                </div>
                <span className="text-xs text-brand">Open chart</span>
              </Link>
            ))}
          </div>
        ) : !patients.isError ? (
          <p className="mt-4 text-sm text-mute">No patient charts have been registered yet.</p>
        ) : null}
      </Card>
    </Page>
  );
}

function DoctorHome() {
  const k = useQuery({ queryKey: ["dash-doc"], queryFn: async () => (await api.get("/dash/doctor")).data.kpis });
  const q = useQuery({ queryKey: ["queue"], queryFn: async () => (await api.get("/op/queue")).data.visits });
  return (
    <Page>
      <Header kicker="Consulting room" title="Your morning list, uncluttered." />
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["On the list", k.data?.today],
          ["Still to see", q.data?.filter((v) => v.queueStatus !== "completed").length],
          ["Diary ahead", k.data?.upcoming],
          ["Labs waiting", k.data?.pendingTests],
        ].map(([l, v]) => (
          <Card key={l}>
            <p className="text-xs text-mute">{l}</p>
            <p className="mt-2 font-serif text-3xl">{v ?? "—"}</p>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        {(q.data || []).map((v) => (
          <Link key={v._id} to={`/consult/${v._id}`}>
            <Card>
              <div className="flex items-center gap-4">
                <img src={avatarUrl(v.patient?.name)} className="h-12 w-12 rounded-full" alt="" />
                <div className="flex-1">
                  <p className="font-medium">{v.patient?.name}</p>
                  <p className="text-sm text-mute">
                    Token {v.tokenNo} · {v.reason}
                  </p>
                </div>
                <Badge tone={v.queueStatus === "waiting" ? "amber" : v.queueStatus === "completed" ? "green" : "blue"}>
                  {v.queueStatus}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Page>
  );
}

function NurseHome() {
  const k = useQuery({ queryKey: ["dash-nurse"], queryFn: async () => (await api.get("/dash/nurse")).data.kpis });
  return (
    <Page>
      <Header kicker="Reception + lab" title="Who just walked in, and who needs a sample." />
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/queue">
          <Card>
            <p className="text-mute">Waiting now</p>
            <p className="font-serif text-5xl">{k.data?.waiting ?? "—"}</p>
          </Card>
        </Link>
        <Link to="/intake">
          <Card>
            <p className="text-mute">New charts today</p>
            <p className="font-serif text-5xl">{k.data?.registrations ?? "—"}</p>
          </Card>
        </Link>
        <Link to="/lab">
          <Card>
            <p className="text-mute">Lab tray</p>
            <p className="font-serif text-5xl">{k.data?.labReq ?? "—"}</p>
          </Card>
        </Link>
      </div>
    </Page>
  );
}

function PharmacyHome() {
  const k = useQuery({ queryKey: ["dash-ph"], queryFn: async () => (await api.get("/dash/pharmacy")).data.kpis });
  return (
    <Page>
      <Header kicker="Dispensary" title="Short stock first. Then the next bag." />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-mute">Below reorder</p>
          <p className="font-serif text-5xl text-[#F59E0B]">{k.data?.lowInventory}</p>
        </Card>
        <Card>
          <p className="text-mute">Counter today</p>
          <p className="font-serif text-5xl">{money(k.data?.dailySales)}</p>
        </Card>
        <Link to="/pharmacy">
          <Card>
            <p className="text-mute">Scripts waiting</p>
            <p className="font-serif text-5xl">{k.data?.pending}</p>
          </Card>
        </Link>
      </div>
    </Page>
  );
}

function BillingHome() {
  const k = useQuery({ queryKey: ["dash-bill"], queryFn: async () => (await api.get("/dash/billing")).data.kpis });
  const bills = useQuery({ queryKey: ["bills"], queryFn: async () => (await api.get("/bills")).data.bills });
  return (
    <Page>
      <Header kicker="Cash desk" title="Nothing leaves without a number." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-mute">Still open</p>
          <p className="font-serif text-5xl">{k.data?.pending}</p>
        </Card>
        <Card>
          <p className="text-mute">Collected today</p>
          <p className="font-serif text-5xl">{money(k.data?.revenue)}</p>
        </Card>
      </div>
      {(bills.data || []).slice(0, 6).map((b) => (
        <Card key={b._id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{b.invoiceNo}</p>
              <p className="text-sm text-mute">{b.patient?.name}</p>
            </div>
            <div className="text-right">
              <p>{money(b.total)}</p>
              <Badge tone={b.status === "paid" ? "green" : "amber"}>{b.status}</Badge>
            </div>
          </div>
        </Card>
      ))}
    </Page>
  );
}

function PatientHome() {
  const d = useQuery({ queryKey: ["dash-pat"], queryFn: async () => (await api.get("/dash/patient")).data });
  const p = d.data?.patient;
  return (
    <Page>
      <Header kicker={p?.mrn} title={p ? `Hello, ${p.name.split(" ")[0]}.` : "Your care at Elara"} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-xs uppercase text-mute">Next visit</p>
          {d.data?.appointment ? (
            <>
              <p className="mt-2 font-serif text-2xl">Dr. {d.data.appointment.doctor?.name}</p>
              <p className="text-sm text-mute">
                {d.data.appointment.department?.name} · {when(d.data.appointment.scheduledAt)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-mute">Nothing on the diary. Book from the side rail.</p>
          )}
        </Card>
        <Card>
          <p className="text-xs uppercase text-mute">Latest script</p>
          {d.data?.prescription ? (
            <ul className="mt-2 text-sm">
              {d.data.prescription.items.map((i, n) => (
                <li key={n}>
                  {i.medicine} · {i.dosage}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-mute">No medicines on file yet.</p>
          )}
        </Card>
        <Card>
          <p className="text-xs uppercase text-mute">Allergies</p>
          <p className="mt-2">{p?.allergies?.join(", ") || "None recorded"}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-mute">Conditions we watch</p>
          <p className="mt-2">{p?.chronicIllnesses?.join(", ") || "None recorded"}</p>
        </Card>
      </div>
    </Page>
  );
}

function Header({ kicker, title }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-mute">{kicker}</p>
      <h1 className="mt-1 max-w-2xl font-serif text-4xl leading-tight">{title}</h1>
    </div>
  );
}
