import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, ageFromDob, avatarUrl, money, when, downloadPdf } from "../lib/api";
import { Page, Card, Badge, Skeleton } from "../components/ui";

export default function Ehr() {
  const { id } = useParams();
  const { data, isLoading, isError } = useQuery({ queryKey: ["ehr", id], queryFn: async () => (await api.get(`/ehr/${id}`)).data });
  const p = data?.patient;
  if (isLoading) return <Skeleton className="h-64" />;
  if (isError) return <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">This patient chart could not be loaded.</p>;
  if (!p) return <p className="text-sm text-mute">Patient chart not found.</p>;
  return (
    <Page>
      <div className="flex flex-wrap items-center gap-4">
        <img src={avatarUrl(p.name)} className="h-20 w-20 rounded-[24px] bg-brand-soft" alt="" />
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">{p.mrn}</p>
          <h1 className="font-serif text-4xl">{p.name}</h1>
          <p className="text-sm text-mute">
            {p.gender || "Gender not recorded"} · {ageFromDob(p.dob)} years · {p.bloodGroup || "Blood group not recorded"}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <p className="text-xs text-mute">Contact and demographics</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>Phone: {p.phone || "Not recorded"}</p>
            <p>Email: {p.email || "Not recorded"}</p>
            <p>Date of birth: {p.dob ? new Date(p.dob).toLocaleDateString("en-IN") : "Not recorded"}</p>
            <p>Address: {p.address || "Not recorded"}</p>
          </div>
        </Card>
        <Card>
          <p className="text-xs text-mute">Allergies</p>
          <p className="mt-2">{p.allergies?.join(", ") || "None recorded"}</p>
        </Card>
        <Card>
          <p className="text-xs text-mute">Medical history</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>Chronic illnesses: {p.chronicIllnesses?.join(", ") || "None recorded"}</p>
            <p>Conditions: {p.conditions?.join(", ") || "None recorded"}</p>
            <p>Surgeries: {p.surgeries?.join(", ") || "None recorded"}</p>
          </div>
        </Card>
        <Card>
          <p className="text-xs text-mute">Last vitals</p>
          <p className="mt-2 text-sm">
            BP {data.ehr?.vitalsLatest?.bp || "—"} · HR {data.ehr?.vitalsLatest?.hr || "—"} · Temp {data.ehr?.vitalsLatest?.temp || "—"} · SpO₂ {data.ehr?.vitalsLatest?.spo2 || "—"}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-mute">Emergency contact</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>{p.emergencyContact?.name || "Not recorded"}</p>
            <p>{p.emergencyContact?.relation || "Relationship not recorded"}</p>
            <p>{p.emergencyContact?.phone || "Phone not recorded"}</p>
          </div>
        </Card>
      </div>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="font-serif text-2xl">Visits</h2>
          {(data.visits || []).map((v) => (
            <div key={v._id} className="mt-3 border-t border-line pt-3 text-sm">
              <p>
                {v.opNumber} · {v.department?.name} · Dr. {v.doctor?.name}
              </p>
              <p className="text-mute">{when(v.visitDate)} · {v.reason}</p>
            </div>
          ))}
        </Card>
        <Card>
          <h2 className="font-serif text-2xl">Prescriptions</h2>
          {(data.rxs || []).map((rx) => (
            <div key={rx._id} className="mt-3 border-t border-line pt-3 text-sm">
              <p>Dr. {rx.doctor?.name}</p>
              {rx.items.map((i, n) => (
                <p key={n}>
                  {i.medicine} · {i.dosage} · {i.duration}
                </p>
              ))}
              <button className="text-brand" onClick={() => downloadPdf(`/prescriptions/${rx._id}/pdf`, "prescription.pdf")}>
                Download PDF
              </button>
            </div>
          ))}
        </Card>
        <Card>
          <h2 className="font-serif text-2xl">Consultations</h2>
          {(data.consults || []).map((consult) => (
            <div key={consult._id} className="mt-3 border-t border-line pt-3 text-sm">
              <p className="font-medium">{consult.diagnosis || "No diagnosis recorded"}</p>
              <p className="text-mute">Dr. {consult.doctor?.name} · {when(consult.createdAt)}</p>
              {consult.symptoms?.length > 0 && <p className="mt-1">Symptoms: {consult.symptoms.join(", ")}</p>}
              {consult.notes && <p className="mt-1">{consult.notes}</p>}
            </div>
          ))}
          {!data.consults?.length && <p className="mt-3 text-sm text-mute">No consultations recorded.</p>}
        </Card>
        <Card>
          <h2 className="font-serif text-2xl">Lab tests</h2>
          {(data.labs || []).map((lab) => (
            <div key={lab._id} className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3 text-sm">
              <span>{lab.testName}</span>
              <Badge tone={lab.status === "completed" ? "green" : "blue"}>{lab.status}</Badge>
            </div>
          ))}
          {!data.labs?.length && <p className="mt-3 text-sm text-mute">No lab tests recorded.</p>}
        </Card>
        <Card>
          <h2 className="font-serif text-2xl">Reports</h2>
          {(data.reports || []).map((r) => (
            <div key={r._id} className="mt-3 text-sm">
              <p className="font-medium">{r.labTest?.testName}</p>
              <p className="text-mute">{r.findings}</p>
            </div>
          ))}
        </Card>
        <Card>
          <h2 className="font-serif text-2xl">Bills</h2>
          {(data.bills || []).map((b) => (
            <div key={b._id} className="mt-3 flex items-center justify-between text-sm">
              <span>{b.invoiceNo}</span>
              <span>
                {money(b.total)} <Badge tone={b.status === "paid" ? "green" : "amber"}>{b.status}</Badge>
              </span>
            </div>
          ))}
        </Card>
      </section>
    </Page>
  );
}
