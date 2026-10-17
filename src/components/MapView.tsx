"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Popup, Rectangle, TileLayer, useMap } from "react-leaflet";
import type { Household, Shelter, Zone } from "@/lib/types";
import { riskColor } from "@/lib/risk";
import type { MapMode } from "./MapClient";

const CITY_CENTER: [number, number] = [24.95, 67.07];

// PLACEHOLDER colouring by ground height (low ground = more exposed). Real score comes in the next step.
function placeholderColor(h: Household): string {
  const g = h.ground_height_m;
  if (g == null) return "#64748b"; // unknown
  if (g < 5) return "#dc2626";
  if (g < 12) return "#f97316";
  return "#16a34a";
}

const SHELTER_GLYPH: Record<string, string> = { school: "S", hospital: "H", clinic: "C", community_centre: "C", place_of_worship: "M" };

function shelterIcon(s: Shelter) {
  const glyph = SHELTER_GLYPH[s.kind ?? ""] ?? "S";
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;border-radius:6px;background:#1d4ed8;color:#fff;font:700 13px/26px system-ui;text-align:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${glyph}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -12],
  });
}

function zoneBounds(z: Zone): [[number, number], [number, number]] {
  return [[z.lat0, z.lon0], [z.lat0 + z.size, z.lon0 + z.size]];
}

// Moves the camera when the mode or the focused zone changes.
function Camera({ mode, focus, households }: { mode: MapMode; focus: Zone | null; households: Household[] }) {
  const map = useMap();
  useEffect(() => {
    if (focus) {
      map.fitBounds(zoneBounds(focus), { maxZoom: 15 });
    } else if (mode === "zones" || households.length === 0) {
      map.setView(CITY_CENTER, 11);
    } else {
      map.fitBounds(L.latLngBounds(households.map((h) => [h.lat, h.lon] as [number, number])), { padding: [30, 30] });
    }
  }, [map, mode, focus, households]);
  return null;
}

const fmt = (v: number | null, d = 1) => (v == null ? "unknown" : v.toFixed(d));

export default function MapView({
  households,
  shelters,
  zones,
  mode,
  focus,
  onPickZone,
}: {
  households: Household[];
  shelters: Shelter[];
  zones: Zone[];
  mode: MapMode;
  focus: Zone | null;
  onPickZone: (z: Zone) => void;
}) {
  return (
    <MapContainer center={CITY_CENTER} zoom={11} scrollWheelZoom preferCanvas className="h-full w-full rounded-lg">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Camera mode={mode} focus={focus} households={households} />

      {mode === "zones" &&
        zones.map((z) => (
          <Rectangle
            key={z.cid}
            bounds={zoneBounds(z)}
            pathOptions={{ color: "#7c2d12", weight: 0.4, fillColor: riskColor(z.risk), fillOpacity: 0.6 }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">Zone {z.cid} (about 1 km)</div>
                <div>Risk: <b>{z.risk.toFixed(0)}</b> / 100</div>
                <div>People (WorldPop 2020): {Math.round(z.pop).toLocaleString()}</div>
                <div>Height above sea level: {fmt(z.elev)} m</div>
                <div>Night light: {fmt(z.light)} (lower = poorer area)</div>
                <div>2022 flood radar: {z.s1 == null ? "unknown" : `${Math.round(z.s1 * 100)}% of zone`}</div>
                <button
                  type="button"
                  onClick={() => onPickZone(z)}
                  className="mt-2 rounded bg-blue-700 px-2 py-1 text-xs font-semibold text-white"
                >
                  Zoom to households
                </button>
              </div>
            </Popup>
          </Rectangle>
        ))}

      {mode === "households" && focus && (
        <Rectangle bounds={zoneBounds(focus)} pathOptions={{ color: "#111827", weight: 2, dashArray: "6 4", fill: false }} />
      )}

      {mode === "households" &&
        households.map((h) => (
          <CircleMarker
            key={h.id}
            center={[h.lat, h.lon]}
            radius={h.source === "satellite" ? 7 : 6}
            pathOptions={{
              color: h.source === "satellite" ? "#111827" : "#ffffff",
              weight: h.source === "satellite" ? 2.5 : 1,
              fillColor: placeholderColor(h),
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{h.id}</div>
                <div>Source: {h.source === "satellite" ? "satellite (unlisted)" : "survey list"}</div>
                <div>Ground height: {h.ground_height_m ?? "unknown"} m</div>
                <div>People (est.): {h.people_count_est ?? "unknown"}</div>
                <div>Oldest (est.): {h.oldest_age_est ?? "unknown"}</div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {mode === "households" &&
        shelters.map((s) => (
          <Marker key={s.id} position={[s.lat, s.lon]} icon={shelterIcon(s)}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{s.name}</div>
                <div>{s.kind ?? "shelter"}</div>
                {s.placeholder && <div className="text-amber-600">Placeholder location</div>}
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
