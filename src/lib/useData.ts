"use client";
import { useEffect, useState } from "react";
import type { Household, Shelter, Zone } from "./types";

type State = {
  households: Household[];
  shelters: Shelter[];
  zones: Zone[];
  loading: boolean;
  error: string | null;
};

export function useData(): State {
  const [state, setState] = useState<State>({ households: [], shelters: [], zones: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/data/households.json").then((r) => {
        if (!r.ok) throw new Error(`households.json: HTTP ${r.status}`);
        return r.json() as Promise<Household[]>;
      }),
      fetch("/data/shelters.json").then((r) => {
        if (!r.ok) throw new Error(`shelters.json: HTTP ${r.status}`);
        return r.json() as Promise<Shelter[]>;
      }),
      // The city layer is optional: if zones.json is missing the app still works with households only.
      fetch("/data/zones.json")
        .then((r) => (r.ok ? (r.json() as Promise<Zone[]>) : []))
        .catch(() => [] as Zone[]),
    ])
      .then(([households, shelters, zones]) => {
        if (!cancelled) setState({ households, shelters, zones, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ households: [], shelters: [], zones: [], loading: false, error: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
