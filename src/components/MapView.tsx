"use client";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Household, Shelter } from "@/lib/types";

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

export default function MapView({ households, shelters }: { households: Household[]; shelters: Shelter[] }) {
  const center: [number, number] = households.length
    ? [households.reduce((a, h) => a + h.lat, 0) / households.length, households.reduce((a, h) => a + h.lon, 0) / households.length]
    : [24.95, 67.2];

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full rounded-lg">
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {households.map((h) => (
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
      {shelters.map((s) => (
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
