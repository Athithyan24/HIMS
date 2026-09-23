import { useQuery } from "@tanstack/react-query";
import { api, money } from "../lib/api";
import { useAuth } from "../store/auth";
import { Page, Card, Badge } from "../components/ui";
import Ehr from "./Ehr";

export function MyRecords() {
  const { patient } = useAuth();
  if (!patient?._id) return <p className="text-mute">No chart linked.</p>;
  return <EhrWrapper id={patient._id} />;
}

function EhrWrapper({ id }) {
  const { data } = useQuery({ queryKey: ["ehr", id], queryFn: async () => (await api.get(`/ehr/${id}`)).data });
  if (!data) return null;
  return (
    <Page>
      <h1 className="font-serif text-4xl">Your chart</h1>
      {(data.consults || []).map((c) => (
        <Card key={c._id}>
          <p className="font-medium">{c.diagnosis}</p>
          <p className="text-sm text-mute">Dr. {c.doctor?.name}</p>
        </Card>
      ))}
      {(data.rxs || []).map((rx) => (
        <Card key={rx._id}>
          {rx.items.map((i, n) => (
            <p key={n} className="text-sm">
              {i.medicine}
            </p>
          ))}
        </Card>
      ))}
    </Page>
  );
}

export function MyBills() {
  const { data } = useQuery({ queryKey: ["bills"], queryFn: async () => (await api.get("/bills")).data.bills });
  return (
    <Page>
      <h1 className="font-serif text-4xl">Your invoices</h1>
      {(data || []).map((b) => (
        <Card key={b._id} className="flex justify-between">
          <div>
            <p>{b.invoiceNo}</p>
            <a className="text-sm text-brand" href={`/api/bills/${b._id}/pdf`}>
              Download
            </a>
          </div>
          <div>
            {money(b.total)} <Badge tone={b.status === "paid" ? "green" : "amber"}>{b.status}</Badge>
          </div>
        </Card>
      ))}
    </Page>
  );
}
