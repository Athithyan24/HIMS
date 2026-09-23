import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, money } from "../lib/api";
import { Page, Card, Button, Badge } from "../components/ui";
import toast from "react-hot-toast";

export default function Pharmacy() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["rxpend"], queryFn: async () => (await api.get("/pharmacy/pending")).data.prescriptions });
  const { data: meds } = useQuery({ queryKey: ["meds"], queryFn: async () => (await api.get("/medicines")).data.medicines });

  const dispense = useMutation({
    mutationFn: (rx) => {
      const items = rx.items
        .map((line) => {
          const med = (meds || []).find((m) => m.name.toLowerCase().includes(String(line.medicine).split(" ")[0].toLowerCase()));
          return med ? { medicine: med._id, qty: 10 } : null;
        })
        .filter(Boolean);
      return api.post(`/pharmacy/dispense/${rx._id}`, { items });
    },
    onSuccess: () => {
      toast.success("Bag ready");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Could not dispense"),
  });

  return (
    <Page>
      <h1 className="font-serif text-4xl">Counter</h1>
      {(data || []).map((rx) => (
        <Card key={rx._id} className="mb-3">
          <p className="font-medium">{rx.patient?.name}</p>
          <p className="text-sm text-mute">Dr. {rx.doctor?.name}</p>
          <ul className="mt-2 text-sm">
            {rx.items.map((i, n) => (
              <li key={n}>
                {i.medicine} · {i.dosage} · {i.duration}
              </li>
            ))}
          </ul>
          <Button className="mt-3" onClick={() => dispense.mutate(rx)}>
            Issue & bill medicines
          </Button>
        </Card>
      ))}
      {!data?.length && <p className="text-mute">No open scripts.</p>}
    </Page>
  );
}

export function Inventory() {
  const { data } = useQuery({ queryKey: ["meds"], queryFn: async () => (await api.get("/medicines")).data.medicines });
  return (
    <Page>
      <h1 className="font-serif text-4xl">Stock room</h1>
      <div className="overflow-x-auto rounded-[20px] bg-white shadow-apple">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-mute">
            <tr>
              <th className="p-3">Medicine</th>
              <th>SKU</th>
              <th>On hand</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((m) => (
              <tr key={m._id} className="border-t border-line">
                <td className="p-3">
                  {m.name} {m.strength}
                  {m.stock <= m.reorderAt && (
                    <Badge tone="amber" className="ml-2">
                      low
                    </Badge>
                  )}
                </td>
                <td>{m.sku}</td>
                <td>{m.stock}</td>
                <td>{money(m.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}
