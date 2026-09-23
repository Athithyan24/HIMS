import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, money, downloadPdf } from "../lib/api";
import { Page, Card, Badge, Button, Field } from "../components/ui";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Billing() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["bills"], queryFn: async () => (await api.get("/bills")).data.bills });
  const { data: queue } = useQuery({ queryKey: ["queue"], queryFn: async () => (await api.get("/op/queue")).data.visits });
  const [visit, setVisit] = useState("");

  const compose = useMutation({
    mutationFn: () => api.post("/bills/compose", { visit }),
    onSuccess: () => {
      toast.success("Invoice drafted");
      qc.invalidateQueries({ queryKey: ["bills"] });
    },
  });
  const pay = useMutation({
    mutationFn: (id) => api.post(`/bills/${id}/pay`, { amount: data.find((b) => b._id === id)?.total, method: "upi" }),
    onSuccess: () => {
      toast.success("Settled");
      qc.invalidateQueries();
    },
  });

  return (
    <Page>
      <h1 className="font-serif text-4xl">Invoices</h1>
      <Card className="max-w-xl">
        <Field label="Compose from today's OP">
          <select value={visit} onChange={(e) => setVisit(e.target.value)}>
            <option value="">Select visit</option>
            {(queue || []).map((v) => (
              <option key={v._id} value={v._id}>
                {v.opNumber} · {v.patient?.name}
              </option>
            ))}
          </select>
        </Field>
        <Button className="mt-3" disabled={!visit} onClick={() => compose.mutate()}>
          Build invoice
        </Button>
      </Card>
      {(data || []).map((b) => (
        <Card key={b._id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium">{b.invoiceNo}</p>
              <p className="text-sm text-mute">{b.patient?.name}</p>
              <ul className="mt-2 text-sm text-mute">
                {b.lines.map((l, i) => (
                  <li key={i}>
                    {l.label} · {money(l.amount)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right">
              <p className="font-serif text-2xl">{money(b.total)}</p>
              <Badge tone={b.status === "paid" ? "green" : "amber"}>{b.status}</Badge>
              <div className="mt-2 flex gap-2">
                {b.status !== "paid" && <Button onClick={() => pay.mutate(b._id)}>Collect</Button>}
                <Button variant="ghost" onClick={() => downloadPdf(`/bills/${b._id}/pdf`, `${b.invoiceNo}.pdf`)}>
                  PDF
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </Page>
  );
}
