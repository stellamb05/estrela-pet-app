import { describe, expect, it } from "vitest";
import { maskPhone, onlyDigits, signUpSchema } from "@/lib/validation";

const base = { email: "a@b.com", phone: "11987654321", password: "123456" };

describe("cadastro", () => {
  it("aceita nome com acentos", () => {
    expect(signUpSchema.safeParse({ ...base, fullName: "João Ávila" }).success).toBe(true);
  });
  it("rejeita nome com números", () => {
    expect(signUpSchema.safeParse({ ...base, fullName: "Ana 2" }).success).toBe(false);
  });
  it("rejeita nome com caractere especial", () => {
    expect(signUpSchema.safeParse({ ...base, fullName: "Ana@" }).success).toBe(false);
  });
  it("rejeita nome com 1 letra", () => {
    expect(signUpSchema.safeParse({ ...base, fullName: "A" }).success).toBe(false);
  });
  it("exige exatamente 11 dígitos no telefone", () => {
    expect(signUpSchema.safeParse({ ...base, fullName: "Ana", phone: "1198765432" }).success).toBe(false);
  });
  it("aplica máscara e guarda só dígitos", () => {
    expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
    expect(onlyDigits("(11) 98765-4321")).toBe("11987654321");
  });
});
