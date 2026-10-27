export type ServiceType = "boarding" | "pet_sitter";
export type Settings = {
  boarding_base_price_cents: number;
  sitter_base_price_cents: number;
  extra_pet_price_cents: number;
};

const DAY = 86_400_000;
const toUtc = (iso: string) => {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
export const daysBetween = (a: string, b: string) => Math.round((toUtc(b) - toUtc(a)) / DAY);
export const todayIso = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

/** Advance-booking adjustment: >=30d -5%, 15-29d -3%, 0-1d +5%, else 0. */
export function advanceAdjustment(advanceDays: number) {
  if (advanceDays >= 30) return -0.05;
  if (advanceDays >= 15) return -0.03;
  if (advanceDays === 0 || advanceDays === 1) return 0.05;
  return 0;
}

/** Boarding blocked when any selected pet is not sociable. */
export const isBoardingBlocked = (service: ServiceType, pets: { is_sociable: boolean }[]) =>
  service === "boarding" && pets.some((p) => !p.is_sociable);

export function quote(opts: {
  service: ServiceType;
  settings: Settings;
  petCount: number;
  startDate: string;
  endDate: string;
  today: string;
}) {
  const { service, settings, petCount, startDate, endDate, today } = opts;
  const days = Math.max(1, daysBetween(startDate, endDate));
  const base = service === "boarding" ? settings.boarding_base_price_cents : settings.sitter_base_price_cents;
  const daily = base + settings.extra_pet_price_cents * Math.max(0, petCount - 1);
  const subtotal = days * daily;
  const advanceDays = daysBetween(today, startDate);
  const adjustment = advanceAdjustment(advanceDays);
  const total = Math.round(subtotal * (1 + adjustment));
  return { days, daily, subtotal, advanceDays, adjustment, total };
}

export const brl = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
