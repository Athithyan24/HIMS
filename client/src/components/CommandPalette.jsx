import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useUi } from "../store/auth";
import { Modal } from "./overlays";
import { useState } from "react";

export function CommandPalette() {
  const { commandOpen, setCommand } = useUi();
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const { data } = useQuery({
    queryKey: ["search", q],
    queryFn: async () => (await api.get("/search", { params: { q } })).data,
    enabled: commandOpen && q.length > 1,
  });

  return (
    <Modal open={commandOpen} onClose={() => setCommand(false)} title="Jump anywhere">
      <input autoFocus placeholder="Patient name or MRN" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
        {data?.patients?.map((p) => (
          <button
            key={p._id}
            className="block w-full rounded-[16px] px-3 py-2 text-left hover:bg-brand-soft"
            onClick={() => {
              setCommand(false);
              nav(`/patients/${p._id}`);
            }}
          >
            <span className="font-medium">{p.name}</span>
            <span className="ml-2 text-xs text-mute">{p.mrn}</span>
          </button>
        ))}
        {data?.doctors?.map((d) => (
          <div key={d._id} className="px-3 py-2 text-sm text-mute">
            Dr. {d.name}
          </div>
        ))}
      </div>
    </Modal>
  );
}
