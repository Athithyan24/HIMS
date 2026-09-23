import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ageFromDob, avatarUrl, when } from "../lib/api";
import { Page, Card, Button, Badge, Field } from "../components/ui";
import { useState } from "react";
import toast from "react-hot-toast";

const LAB_OPTS = ["Blood Test", "ECG", "X-Ray", "Thyroid Test"];

export default function Consult() {
  const { visitId } = useParams();
  const qc = useQueryClient();
  const { data: visitWrap } = useQuery({
    queryKey: ["visit", visitId],
    queryFn: async () => (await api.get(`/op/${visitId}`)).data.visit,
  });
  const visit = visitWrap;
  const { data: ehr } = useQuery({
    queryKey: ["ehr", visit?.patient?._id],
    enabled: Boolean(visit?.patient?._id),
    queryFn: async () => (await api.get(`/ehr/${visit.patient._id}`)).data,
  });
  const [symptoms, setSymptoms] = useState("Fever, Body Pain, Headache");
  const [diagnosis, setDiagnosis] = useState("Viral Fever");
  const [notes, setNotes] = useState("");
  const [rx, setRx] = useState([{ medicine: "Paracetamol 650mg", dosage: "1-1-1", duration: "3 days", instructions: "After food" }]);
  const [labs, setLabs] = useState([]);

  const save = useMutation({
    mutationFn: () =>
      api.post(`/consult/${visitId}`, {
        symptoms: symptoms.split(",").map((s) => s.trim()).filter(Boolean),
        diagnosis,
        notes,
        prescription: rx,
        labs,
        vitals: { bp: "120/80", hr: "78", temp: "37.4", spo2: "98" },
      }),
    onSuccess: () => {
      toast.success("Consult closed. Chart updated.");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not save"),
  });

  const p = ehr?.patient || visit?.patient;

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-mute">{visit?.opNumber}</p>
          <h1 className="font-serif text-4xl">{p?.name || "Consult"}</h1>
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          Close consult
        </Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <div className="flex gap-4">
            <img src={avatarUrl(p?.name)} className="h-16 w-16 rounded-full" alt="" />
            <div>
              <p className="text-sm text-mute">
                {p?.gender} · {ageFromDob(p?.dob)} yrs · {p?.bloodGroup}
              </p>
              <p className="text-sm">{p?.mrn}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="text-mute">Allergies · </span>
              {p?.allergies?.join(", ") || "None known"}
            </p>
            <p>
              <span className="text-mute">Chronic · </span>
              {p?.chronicIllnesses?.join(", ") || "—"}
            </p>
          </div>
          <div className="mt-4">
            <p className="text-xs uppercase text-mute">Earlier visits</p>
            {(ehr?.visits || []).slice(0, 4).map((v) => (
              <p key={v._id} className="mt-2 text-sm">
                {when(v.visitDate)} · {v.department?.name}
              </p>
            ))}
          </div>
        </Card>
        <div className="space-y-4 lg:col-span-3">
          <Card>
            <Field label="Symptoms">
              <input value={symptoms} onChange={(e) => setSymptoms(e.target.value)} />
            </Field>
            <div className="mt-3">
              <Field label="Working diagnosis">
                <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Note to the chart">
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </Field>
            </div>
          </Card>
          <Card>
            <p className="text-sm font-medium">Prescription</p>
            {rx.map((row, i) => (
              <div key={i} className="mt-2 grid gap-2 sm:grid-cols-4">
                <input value={row.medicine} onChange={(e) => upd(setRx, rx, i, "medicine", e.target.value)} />
                <input value={row.dosage} onChange={(e) => upd(setRx, rx, i, "dosage", e.target.value)} />
                <input value={row.duration} onChange={(e) => upd(setRx, rx, i, "duration", e.target.value)} />
                <input value={row.instructions} onChange={(e) => upd(setRx, rx, i, "instructions", e.target.value)} />
              </div>
            ))}
            <Button variant="ghost" className="mt-2" type="button" onClick={() => setRx([...rx, { medicine: "", dosage: "", duration: "", instructions: "" }])}>
              Add line
            </Button>
          </Card>
          <Card>
            <p className="text-sm font-medium">Lab, if needed</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {LAB_OPTS.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setLabs((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]))}
                  className={`rounded-full px-3 py-1 text-sm ${labs.includes(t) ? "bg-brand text-white" : "bg-slate-100"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Page>
  );
}

function upd(set, arr, i, k, v) {
  const next = arr.slice();
  next[i] = { ...next[i], [k]: v };
  set(next);
}
