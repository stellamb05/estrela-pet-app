import { z } from "zod";

export const NAME_REGEX = /^[a-zA-Zá-úÁ-Úâ-ûÂ-Ûã-õÃ-Õ ]+$/;

export const onlyDigits = (v: string) => v.replace(/\D/g, "").slice(0, 11);

/** Display mask (XX) 9XXXX-XXXX — storage keeps digits only. */
export function maskPhone(v: string) {
  const d = onlyDigits(v);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 letras")
    .max(100, "Nome muito longo")
    .regex(NAME_REGEX, "Use apenas letras e espaços"),
  email: z.string().trim().email("E-mail inválido").max(255),
  phone: z.string().regex(/^\d{11}$/, "Informe DDD + 9 dígitos (11 números)"),
  password: z.string().min(6, "Mínimo de 6 caracteres").max(72),
});

export const signInSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  password: z.string().min(1, "Informe sua senha"),
});
