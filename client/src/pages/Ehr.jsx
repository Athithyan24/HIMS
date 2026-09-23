import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, ageFromDob, avatarUrl, money, when, downloadPdf } from "../lib/api";
import { Page, Card, Badge, Button } from "../components/ui";

export default function Ehr() {
  const { id } = useParams();
  const { data } = useQuery({ queryKey: ["ehr", id], queryFn: async () => (await api.get(`/ehr/${id}`)).data });
  const p = data?.patient;
  if (!p) return null;
  return (
    <Page>
      <div className="flex flex-wrap items-center gap-4">
        <img src={avatarUrl(p.name)} className="h-20 w-20 rounded-[24px] bg-brand-soft" alt="" />
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">{p.mrn}</p>
          <h1 className="font-serif text-4xl">{p.name}</h1>
          <p className="text-sm text-mute">
            {p.gender} · {ageFromDob(p.dob)} · {p.bloodGroup} · {p.phone}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs text-mute">Allergies</p>
          <p className="mt-2">{p.allergies?.join(", ") || "None recorded"}</p>
        </Card>
        <Card>
          <p className="text-xs text-mute">Chronic</p>
          <p className="mt-2">{p.chronicIllnesses?.join(", ") || "—"}</p>
        </Card>
        <Card>
          <p className="text-xs text-mute">Last vitals</p>
          <p className="mt-2 text-sm">
            {data.ehr?.vitalsLatest?.bp} · HR {data.ehr?.vitalsLatest?.hr}
          </p>
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
