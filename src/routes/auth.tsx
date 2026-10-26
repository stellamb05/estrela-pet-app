import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { maskPhone, onlyDigits, signInSchema, signUpSchema } from "@/lib/validation";

const safePath = (p?: string) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "/booking");

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string } =>
    typeof s["redirect"] === "string" ? { redirect: s["redirect"] } : {},
  head: () => ({
    meta: [
      { title: "Entrar ou cadastrar · Lar de Patas" },
      { name: "description", content: "Acesse sua conta Lar de Patas para cadastrar pets e agendar hospedagem ou pet sitter." },
      { property: "og:title", content: "Entrar · Lar de Patas" },
      { property: "og:description", content: "Acesse sua conta para agendar." },
    ],
  }),
  component: AuthPage,
});

type Errors = Partial<Record<"fullName" | "email" | "phone" | "password", string>>;
const toErrors = (e: z.ZodError): Errors =>
  Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message])) as Errors;

function FieldError({ msg }: { msg?: string | undefined }) {
  return msg ? <p className="mt-1 text-xs text-destructive">{msg}</p> : null;
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const { session } = useAuth();
  const target = safePath(redirect);

  useEffect(() => {
    if (session) navigate({ to: target, replace: true });
  }, [session, target, navigate]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-5 py-12">
      <div className="w-full rounded-2xl border border-border bg-card p-8 shadow-soft">
        <h1 className="text-2xl text-foreground">Bem-vindo(a)</h1>
        <p className="mt-1 text-sm text-muted-foreground">Entre ou crie sua conta para agendar.</p>
        <Tabs defaultValue="login" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Cadastrar</TabsTrigger>
          </TabsList>
          <TabsContent value="login"><SignIn /></TabsContent>
          <TabsContent value="signup"><SignUp target={target} /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = signInSchema.safeParse({ email, password });
    if (!r.success) return setErrors(toErrors(r.error));
    setErrors({});
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(r.data);
    setBusy(false);
    if (error) toast.error("E-mail ou senha incorretos.");
    else toast.success("Que bom te ver de novo!");
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
      <div>
        <Label htmlFor="li-email">E-mail</Label>
        <Input id="li-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FieldError msg={errors.email} />
      </div>
      <div>
        <Label htmlFor="li-pass">Senha</Label>
        <Input id="li-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <FieldError msg={errors.password} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Entrando..." : "Entrar"}</Button>
    </form>
  );
}

function SignUp({ target }: { target: string }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const r = signUpSchema.safeParse({ fullName, email, phone, password });
    if (!r.success) return setErrors(toErrors(r.error));
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: r.data.email,
      password: r.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}${target}`,
        data: { full_name: r.data.fullName, phone: r.data.phone },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message.includes("registered") ? "Este e-mail já está cadastrado." : "Não foi possível cadastrar.");
    if (!data.session) {
      setSent(true);
      toast.success("Cadastro feito! Confirme seu e-mail.");
    }
  };

  if (sent)
    return (
      <p className="mt-6 rounded-lg bg-muted p-4 text-sm text-foreground">
        Enviamos um link de confirmação para <strong>{email}</strong>. Depois de confirmar, você poderá agendar.
      </p>
    );

  return (
    <form onSubmit={submit} className="mt-4 space-y-4" noValidate>
      <div>
        <Label htmlFor="su-name">Nome completo</Label>
        <Input id="su-name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <FieldError msg={errors.fullName} />
      </div>
      <div>
        <Label htmlFor="su-email">E-mail</Label>
        <Input id="su-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FieldError msg={errors.email} />
      </div>
      <div>
        <Label htmlFor="su-phone">Celular (WhatsApp)</Label>
        <Input
          id="su-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(11) 98765-4321"
          value={maskPhone(phone)}
          onChange={(e) => setPhone(onlyDigits(e.target.value))}
        />
        <FieldError msg={errors.phone} />
      </div>
      <div>
        <Label htmlFor="su-pass">Senha</Label>
        <Input id="su-pass" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <FieldError msg={errors.password} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? "Criando conta..." : "Criar conta"}</Button>
    </form>
  );
}
