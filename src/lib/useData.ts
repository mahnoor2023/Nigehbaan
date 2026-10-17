"use client";
import { useEffect, useState } from "react";
import type { Household, Shelter } from "./types";

type State = {
  households: Household[];
  shelters: Shelter[];
  loading: boolean;
  error: string | null;
};

export function useData(): State {
  const [state, setState] = useState<State>({ households: [], shelters: [], loading: true, error: null });

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
    ])
      .then(([households, shelters]) => {
        if (!cancelled) setState({ households, shelters, loading: false, error: null });
      })
      .catch((e: unknown) => {
        if (!cancelled) setState({ households: [], shelters: [], loading: false, error: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
