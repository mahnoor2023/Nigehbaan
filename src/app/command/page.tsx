"use client";
import MapClient from "@/components/MapClient";
import PageShell from "@/components/PageShell";
import { useData } from "@/lib/useData";

function Dot({ color, ring }: { color: string; ring?: boolean }) {
  return <span className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: color, border: ring ? "2px solid #111827" : "1px solid #fff", boxShadow: "0 0 0 1px #cbd5e1" }} />;
}

export default function CommandPage() {
  const { households, shelters, loading, error } = useData();
  const hidden = households.filter((h) => h.source === "satellite").length;

  return (
    <PageShell title="Command Center" subtitle="Live map of households and shelters. Colours are placeholders until the vulnerability score is added.">
      {error && <div className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">Could not load data: {error}</div>}

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
        <span><Dot color="#dc2626" /> low ground</span>
        <span><Dot color="#f97316" /> medium</span>
        <span><Dot color="#16a34a" /> high ground</span>
        <span><Dot color="#64748b" /> unknown</span>
        <span><Dot color="#f97316" ring /> unlisted (satellite)</span>
        <span><span className="inline-block h-3 w-3 rounded-sm bg-blue-700 align-middle" /> shelter</span>
        {!loading && !error && (
          <span className="ml-auto font-medium text-slate-800">
            {households.length} households ({hidden} unlisted) · {shelters.length} shelters
          </span>
        )}
      </div>

      <div className="h-[calc(100dvh-14rem)] min-h-[360px] overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading data...</div>
        ) : (
          <MapClient households={households} shelters={shelters} />
        )}
      </div>
    </PageShell>
  );
}
