"use client";
import dynamic from "next/dynamic";
import type { Household, Shelter } from "@/lib/types";

// Leaflet touches `window`, so the map is loaded on the client only.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading map...</div>,
});

export default function MapClient(props: { households: Household[]; shelters: Shelter[] }) {
  return <MapView {...props} />;
}
