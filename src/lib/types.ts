export type Household = {
  id: string;
  lat: number;
  lon: number;
  ground_height_m: number | null;
  flood_history: number | null;
  night_light: number | null;
  people_count_est: number | null;
  oldest_age_est: number | null;
  lives_alone_est: string | null;
  has_disability_est: string | null;
  chronic_illness_est: string | null;
  floor_est: string | null;
  phone_signal_est: string | null;
  has_smartphone_est: string | null;
  income_band_est: string | null;
  /** "survey" = on the official list, "satellite" = hidden/unlisted (found from building footprints) */
  source: "survey" | "satellite";
};

export type Shelter = {
  id: string;
  name: string;
  kind: string | null;
  lat: number;
  lon: number;
  placeholder: boolean;
};
