import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { api, ageFromDob, avatarUrl } from "../lib/api";
import { Card, Empty, Page, Skeleton } from "../components/ui";

export default function Patients() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useQuery({
    queryKey: ["patients", search],
    queryFn: async () => (await api.get("/patients", { params: { q: search } })).data.patients,
  });

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-mute">Patient records</p>
          <h1 className="mt-1 font-serif text-4xl">Patients</h1>
          <p className="mt-2 text-sm text-mute">Search charts by patient name, MRN, or phone number.</p>
        </div>
        <label className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" size={17} />
          <input
            aria-label="Search patients"
            className="pl-10"
            placeholder="Search patients"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {isLoading && <Skeleton className="h-48" />}
      {isError && <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">Patient records could not be loaded. Please try again.</p>}
      {!isLoading && !isError && data?.length === 0 && (
        <Empty title="No patients found" copy={search ? "Try a different name, MRN, or phone number." : "Patient charts will appear here when they are registered."} />
      )}
      {!isLoading && !isError && data?.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.map((patient) => {
            const age = ageFromDob(patient.dob);
            return (
              <Link key={patient._id} to={`/patients/${patient._id}`} className="rounded-[20px] outline-none focus-visible:ring-2 focus-visible:ring-brand">
                <Card className="h-full transition-shadow hover:shadow-lift">
                  <div className="flex items-center gap-3">
                    <img src={avatarUrl(patient.name)} alt="" className="h-12 w-12 rounded-full bg-brand-soft" />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{patient.name}</p>
                      <p className="text-xs text-mute">{patient.mrn}</p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1 text-sm">
                    <p>{patient.gender || "Gender not recorded"} · {age === "—" ? "Age not recorded" : `${age} years`}</p>
                    <p className="truncate text-mute">{patient.phone || patient.email || "No contact details recorded"}</p>
                    <p className="text-brand">Open patient chart <span aria-hidden="true">→</span></p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </Page>
  );
}
