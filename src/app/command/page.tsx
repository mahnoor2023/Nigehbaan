"use client";
import { useMemo, useState } from "react";
import MapClient, { type MapMode } from "@/components/MapClient";
import { RISK_STEPS } from "@/lib/risk";
import PageShell from "@/components/PageShell";
import { useData } from "@/lib/useData";
import type { Zone } from "@/lib/types";

function Dot({ color, ring }: { color: string; ring?: boolean }) {
  return <span className="inline-block h-3 w-3 rounded-full align-middle" style={{ background: color, border: ring ? "2px solid #111827" : "1px solid #fff", boxShadow: "0 0 0 1px #cbd5e1" }} />;
}

export default function CommandPage() {
  const { households, shelters, zones, loading, error } = useData();
  const [mode, setMode] = useState<MapMode>("zones");
  const [focus, setFocus] = useState<Zone | null>(null);
  const hidden = households.filter((h) => h.source === "satellite").length;
  const hasZones = zones.length > 0;
  const effectiveMode: MapMode = hasZones ? mode : "households";

  const inFocus = useMemo(() => {
    if (!focus) return 0;
    return households.filter((h) => h.lat >= focus.lat0 && h.lat <= focus.lat0 + focus.size && h.lon >= focus.lon0 && h.lon <= focus.lon0 + focus.size).length;
  }, [focus, households]);
  const totalPop = useMemo(() => zones.reduce((a, z) => a + z.pop, 0), [zones]);

  const pick = (z: Zone) => {
    setFocus(z);
    setMode("households");
  };
  const switchMode = (m: MapMode) => {
    setFocus(null);
    setMode(m);
  };

  return (
    <PageShell title="Command Center" subtitle="City view first, then households inside the riskiest zones. Household colours are placeholders until the vulnerability score is added.">
      {error && <div className="mb-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">Could not load data: {error}</div>}

      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
        {hasZones && (
          <div className="inline-flex overflow-hidden rounded-md border border-slate-300 text-sm" role="group" aria-label="Map layer">
            {(["zones", "households"] as MapMode[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={effectiveMode === m}
                onClick={() => switchMode(m)}
                className={`px-3 py-1.5 font-medium ${effectiveMode === m ? "bg-blue-700 text-white" : "bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                {m === "zones" ? "City zones" : "Households"}
              </button>
            ))}
          </div>
        )}

        {effectiveMode === "zones" ? (
          RISK_STEPS.map((s) => (
            <span key={s.min}>
              <span className="mr-1 inline-block h-3 w-3 rounded-sm align-middle" style={{ background: s.color, boxShadow: "0 0 0 1px #cbd5e1" }} />
              {s.label}
            </span>
          ))
        ) : (
          <>
            <span><Dot color="#dc2626" /> low ground</span>
            <span><Dot color="#f97316" /> medium</span>
            <span><Dot color="#16a34a" /> high ground</span>
            <span><Dot color="#64748b" /> unknown</span>
            <span><Dot color="#f97316" ring /> unlisted (satellite)</span>
            <span><span className="inline-block h-3 w-3 rounded-sm bg-blue-700 align-middle" /> shelter</span>
          </>
        )}

        {!loading && !error && (
          <span className="ml-auto font-medium text-slate-800">
            {effectiveMode === "zones"
              ? `${zones.length.toLocaleString()} zones · ${Math.round(totalPop / 1e5) / 10} million people`
              : `${households.length} households (${hidden} unlisted) · ${shelters.length} shelters`}
          </span>
        )}
      </div>

      {focus && effectiveMode === "households" && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-slate-300 bg-slate-50 p-2 text-sm text-slate-700">
          <span>
            Zone {focus.cid}: risk {focus.risk.toFixed(0)}, about {Math.round(focus.pop).toLocaleString()} people.{" "}
            {inFocus === 0 ? "No household data loaded for this zone yet (households exist only for the top zones)." : `${inFocus} households in this zone.`}
          </span>
          <button type="button" onClick={() => switchMode("zones")} className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium">
            Back to city
          </button>
        </div>
      )}

      <div className="h-[calc(100dvh-14rem)] min-h-[360px] overflow-hidden rounded-lg border border-slate-200 bg-white">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading data...</div>
        ) : (
          <MapClient households={households} shelters={shelters} zones={zones} mode={effectiveMode} focus={focus} onPickZone={pick} />
        )}
      </div>
    </PageShell>
  );
}
