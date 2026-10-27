import { describe, expect, it } from "vitest";
import { isBoardingBlocked, quote } from "@/lib/pricing";

const settings = { boarding_base_price_cents: 10000, sitter_base_price_cents: 8000, extra_pet_price_cents: 3000 };
const q = (startDate: string, endDate: string, petCount = 1, service: "boarding" | "pet_sitter" = "boarding") =>
  quote({ service, settings, petCount, startDate, endDate, today: "2026-01-01" });

describe("precificação", () => {
  it("diárias com pet extra: 2 dias x (100 + 30)", () => {
    expect(q("2026-01-05", "2026-01-07", 2).subtotal).toBe(26000);
  });
  it("30+ dias de antecedência dá -5%", () => {
    expect(q("2026-01-31", "2026-02-01").total).toBe(9500);
  });
  it("15 dias de antecedência dá -3%", () => {
    expect(q("2026-01-16", "2026-01-17").total).toBe(9700);
  });
  it("29 dias de antecedência dá -3%", () => {
    expect(q("2026-01-30", "2026-01-31").total).toBe(9700);
  });
  it("mesmo dia dá +5%", () => {
    expect(q("2026-01-01", "2026-01-02").total).toBe(10500);
  });
  it("1 dia de antecedência dá +5%", () => {
    expect(q("2026-01-02", "2026-01-03").total).toBe(10500);
  });
  it("2 a 14 dias sem ajuste", () => {
    expect(q("2026-01-10", "2026-01-11").total).toBe(10000);
  });
  it("pet sitter usa preço base do sitter", () => {
    expect(q("2026-01-10", "2026-01-11", 1, "pet_sitter").total).toBe(8000);
  });
});

describe("trava de sociabilidade", () => {
  it("bloqueia hospedagem com pet não sociável", () => {
    expect(isBoardingBlocked("boarding", [{ is_sociable: true }, { is_sociable: false }])).toBe(true);
  });
  it("permite pet sitter com pet não sociável", () => {
    expect(isBoardingBlocked("pet_sitter", [{ is_sociable: false }])).toBe(false);
  });
});
