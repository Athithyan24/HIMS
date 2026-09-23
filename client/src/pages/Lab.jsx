import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Page, Card, Badge, Button, Field } from "../components/ui";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Lab() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["labs"], queryFn: async () => (await api.get("/labs")).data.labs });
  const [findings, setFindings] = useState("");
  const [open, setOpen] = useState(null);

  const patch = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/labs/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["labs"] }),
  });
  const report = useMutation({
    mutationFn: (id) => api.post(`/labs/${id}/report`, { findings, values: [{ label: "Result", value: "Within range", range: "—" }] }),
    onSuccess: () => {
      toast.success("Report on the chart");
      setOpen(null);
      qc.invalidateQueries({ queryKey: ["labs"] });
    },
  });

  return (
    <Page>
      <h1 className="font-serif text-4xl">Lab bench</h1>
      <p className="text-sm text-mute">Requested → collected → processing → on the chart.</p>
      <div className="space-y-3">
        {(data || []).map((l) => (
          <Card key={l._id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">
                  {l.testName} · {l.patient?.name}
                </p>
                <p className="text-sm text-mute">Dr. {l.doctor?.name}</p>
              </div>
              <Badge tone={l.status === "completed" ? "green" : l.status === "requested" ? "amber" : "blue"}>{l.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {l.status === "requested" && (
                <Button variant="soft" onClick={() => patch.mutate({ id: l._id, status: "collected" })}>
                  Sample in
                </Button>
              )}
              {l.status === "collected" && (
                <Button variant="soft" onClick={() => patch.mutate({ id: l._id, status: "processing" })}>
                  Run
                </Button>
              )}
              {l.status === "processing" && (
                <Button onClick={() => setOpen(l._id)}>Attach result</Button>
              )}
            </div>
            {open === l._id && (
              <div className="mt-3 space-y-2">
                <Field label="Findings">
                  <textarea rows={3} value={findings} onChange={(e) => setFindings(e.target.value)} />
                </Field>
                <Button onClick={() => report.mutate(l._id)}>Publish</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Page>
  );
}
