// City layer colour: higher risk = darker. Five steps (light yellow to dark red).
// Kept out of MapView so pages can use it without loading Leaflet on the server.
export const RISK_STEPS: { min: number; color: string; label: string }[] = [
  { min: 0, color: "#fde68a", label: "under 20" },
  { min: 20, color: "#fbbf24", label: "20 to 35" },
  { min: 35, color: "#f97316", label: "35 to 50" },
  { min: 50, color: "#dc2626", label: "50 to 60" },
  { min: 60, color: "#7f1d1d", label: "60 and above" },
];

export function riskColor(r: number): string {
  let c = RISK_STEPS[0].color;
  for (const s of RISK_STEPS) if (r >= s.min) c = s.color;
  return c;
}
