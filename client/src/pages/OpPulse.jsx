import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Page, Card } from "../components/ui";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

export default function OpPulse() {
  const { data } = useQuery({ queryKey: ["op-an"], queryFn: async () => (await api.get("/op/analytics")).data });
  const { data: depts } = useQuery({ queryKey: ["depts"], queryFn: async () => (await api.get("/departments")).data.departments });
  const chart = (depts || []).map((d) => {
    const row = data?.byDept?.find((x) => x._id === d._id);
    return { name: d.name.split(" ")[0], count: row?.count || d.opCount || 0 };
  });
  return (
    <Page>
      <h1 className="font-serif text-4xl">OP pulse</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-mute">Today</p>
          <p className="font-serif text-5xl">{data?.daily}</p>
        </Card>
        <Card>
          <p className="text-mute">This week</p>
          <p className="font-serif text-5xl">{data?.weekly}</p>
        </Card>
        <Card>
          <p className="text-mute">This month</p>
          <p className="font-serif text-5xl">{data?.monthly}</p>
        </Card>
      </div>
      <Card>
        <p className="text-sm text-mute">By floor, this month</p>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={chart}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </Page>
  );
}

export function Departments() {
  const { data } = useQuery({ queryKey: ["depts"], queryFn: async () => (await api.get("/departments")).data.departments });
  return (
    <Page>
      <h1 className="font-serif text-4xl">Seven floors</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {(data || []).map((d) => (
          <Card key={d._id}>
            <p className="text-xs uppercase tracking-wide text-mute">{d.floor}</p>
            <h2 className="font-serif text-3xl">{d.name}</h2>
            <p className="mt-2 text-sm text-mute">{d.opHours}</p>
            <p className="mt-4 text-sm">
              Head · Dr. {d.head?.name} · {d.doctors} consultants · {d.opCount} OP today
            </p>
          </Card>
        ))}
      </div>
    </Page>
  );
}
