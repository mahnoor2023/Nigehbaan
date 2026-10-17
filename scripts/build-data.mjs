// Converts data/*.csv into public/data/*.json
// Usage: npm run data
// - empty cells -> null (never crash on missing values)
// - ~20% of households are marked source="satellite" (hidden/unlisted), chosen with a fixed seed
// - if data/shelters.csv is missing, clearly-labelled PLACEHOLDER shelters are generated
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const IN = path.join(ROOT, "data");
const OUT = path.join(ROOT, "public", "data");
fs.mkdirSync(OUT, { recursive: true });

const SEED = 20261017;
const SATELLITE_SHARE = 0.2;

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Minimal CSV parser with quoted-field support
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQ = false;
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field !== "" || row.length) { row.push(field); if (row.some((v) => v !== "")) rows.push(row); }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

const num = (v, digits) => {
  if (v === "" || v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  return digits == null ? n : Number(n.toFixed(digits));
};
const str = (v) => (v === "" || v == null ? null : v);

// ---------- households ----------
const hhRows = parseCsv(fs.readFileSync(path.join(IN, "households.csv"), "utf8"));
const rand = mulberry32(SEED);
const idx = hhRows.map((_, i) => i);
for (let i = idx.length - 1; i > 0; i--) { // seeded Fisher-Yates
  const j = Math.floor(rand() * (i + 1));
  [idx[i], idx[j]] = [idx[j], idx[i]];
}
const satelliteSet = new Set(idx.slice(0, Math.round(hhRows.length * SATELLITE_SHARE)));

const households = hhRows.map((r, i) => ({
  id: r.id,
  lat: num(r.lat),
  lon: num(r.lon),
  ground_height_m: num(r.ground_height_m, 1),
  flood_history: num(r.flood_history, 3),
  night_light: num(r.night_light, 2),
  people_count_est: num(r.people_count_est),
  oldest_age_est: num(r.oldest_age_est),
  lives_alone_est: str(r.lives_alone_est),
  has_disability_est: str(r.has_disability_est),
  chronic_illness_est: str(r.chronic_illness_est),
  floor_est: str(r.floor_est),
  phone_signal_est: str(r.phone_signal_est),
  has_smartphone_est: str(r.has_smartphone_est),
  income_band_est: str(r.income_band_est),
  source: satelliteSet.has(i) ? "satellite" : "survey",
})).filter((h) => h.lat != null && h.lon != null);

fs.writeFileSync(path.join(OUT, "households.json"), JSON.stringify(households, null, 1));

// ---------- shelters ----------
let shelters;
const shPath = path.join(IN, "shelters.csv");
if (fs.existsSync(shPath)) {
  shelters = parseCsv(fs.readFileSync(shPath, "utf8"))
    .map((r, i) => ({
      id: `S${String(i + 1).padStart(2, "0")}`,
      name: str(r.name) ?? "Shelter",
      kind: str(r.kind),
      lat: num(r.lat),
      lon: num(r.lon),
      placeholder: false,
    }))
    .filter((s) => s.lat != null && s.lon != null);
} else {
  console.warn("WARNING: data/shelters.csv not found -> generating PLACEHOLDER shelters. Add the real file and re-run `npm run data`.");
  const lat0 = households.reduce((a, h) => a + h.lat, 0) / households.length;
  const lon0 = households.reduce((a, h) => a + h.lon, 0) / households.length;
  const offsets = [[0.012, 0.012, "school"], [-0.012, 0.015, "hospital"], [0.015, -0.015, "community_centre"], [-0.014, -0.012, "school"], [0.0, 0.0, "place_of_worship"]];
  shelters = offsets.map(([dla, dlo, kind], i) => ({
    id: `S${String(i + 1).padStart(2, "0")}`,
    name: `Placeholder shelter ${i + 1}`,
    kind,
    lat: Number((lat0 + dla).toFixed(6)),
    lon: Number((lon0 + dlo).toFixed(6)),
    placeholder: true,
  }));
}
fs.writeFileSync(path.join(OUT, "shelters.json"), JSON.stringify(shelters, null, 1));

const sat = households.filter((h) => h.source === "satellite").length;
console.log(`households: ${households.length} (satellite/hidden: ${sat}, survey: ${households.length - sat})`);
console.log(`shelters: ${shelters.length}${shelters[0]?.placeholder ? " (PLACEHOLDER)" : ""}`);
