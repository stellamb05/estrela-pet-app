import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageShell, EmptyCard } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { brl, isBoardingBlocked, quote, todayIso, type ServiceType, type Settings } from "@/lib/pricing";

export const Route = createFileRoute("/_authenticated/booking")({
  head: () => ({
    meta: [
      { title: "Agendar · Lar de Patas" },
      { name: "description", content: "Escolha serviço, pets e datas e veja o valor na hora." },
      { property: "og:title", content: "Agendar · Lar de Patas" },
      { property: "og:description", content: "Escolha serviço, pets e datas e veja o valor na hora." },
    ],
  }),
  component: BookingPage,
});

function BookingPage() {
  const today = todayIso();
  const [pets, setPets] = useState<Tables<"pets">[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [service, setService] = useState<ServiceType>("boarding");
  const [selected, setSelected] = useState<string[]>([]);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from("pets").select("*").eq("active", true).order("created_at").then(({ data }) => setPets(data ?? []));
    supabase.from("app_settings").select("*").limit(1).maybeSingle().then(({ data }) => setSettings(data));
  }, []);

  const chosen = pets.filter((p) => selected.includes(p.id));
  const blocked = isBoardingBlocked(service, chosen);
  const datesOk = !!start && !!end && start >= today && end >= start;
  const q = useMemo(
    () => (settings && datesOk && chosen.length ? quote({ service, settings, petCount: chosen.length, startDate: start, endDate: end, today }) : null),
    [settings, datesOk, chosen.length, service, start, end, today],
  );
  const canSubmit = !!q && !blocked && !saving;

  const submit = async () => {
    if (!q || blocked) return undefined;
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { data: prof } = await supabase.from("profiles").select("phone").eq("id", u.user!.id).maybeSingle();
    const { data: booking, error } = await supabase.from("bookings").insert({
      profile_id: u.user!.id, service_type: service, status: "pending", start_date: start, end_date: end,
      total_cents: q.total, customer_phone: prof?.phone || "",
    }).select("id").single();
    if (error || !booking) { setSaving(false); toast.error("Não foi possível criar o agendamento"); return; }
    const { error: e2 } = await supabase.from("booking_pets").insert(chosen.map((p) => ({ booking_id: booking.id, pet_id: p.id })));
    setSaving(false);
    if (e2) { toast.error("Agendamento criado, mas houve erro ao vincular os pets"); return; }
    setDone(true);
  };

  if (done) {
    return (
      <PageShell title="Pedido enviado!" subtitle="Recebemos seu agendamento.">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <p className="mt-4 text-lg text-foreground">Seu pedido está aguardando aprovação.</p>
          <p className="mt-2 text-muted-foreground">Em breve entraremos em contato pelo WhatsApp com o link do Pix para pagamento.</p>
          <Button asChild className="mt-6"><Link to="/">Voltar ao início</Link></Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Agendar" subtitle="Escolha o serviço, seus pets e as datas.">
      {pets.length === 0 ? (
        <EmptyCard>Cadastre um pet antes de agendar. <Link to="/pets" className="text-primary underline">Ir para Meus Pets</Link></EmptyCard>
      ) : (
        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          <div className="space-y-6 rounded-xl border border-border bg-card p-6">
            <div className="space-y-2">
              <Label>Serviço</Label>
              <div className="flex gap-2">
                <Button type="button" variant={service === "boarding" ? "default" : "outline"} onClick={() => setService("boarding")}>Hospedagem</Button>
                <Button type="button" variant={service === "pet_sitter" ? "default" : "outline"} onClick={() => setService("pet_sitter")}>Pet Sitter</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Pets</Label>
              {pets.map((p) => (
                <label key={p.id} className="flex items-center gap-3 text-foreground">
                  <Checkbox checked={selected.includes(p.id)} onCheckedChange={(c) => setSelected((s) => (c ? [...s, p.id] : s.filter((x) => x !== p.id)))} />
                  {p.name} <span className="text-sm text-muted-foreground">{p.is_sociable ? "· sociável" : "· não sociável"}</span>
                </label>
              ))}
              {blocked && (
                <div role="alert" className="mt-2 flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  Hospedagem restrita a pets sociáveis. Selecione Pet Sitter
                </div>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="start">Início</Label>
                <Input id="start" type="date" min={today} value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end">Fim</Label>
                <Input id="end" type="date" min={start || today} value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            {start && end && !datesOk && <p className="text-sm text-destructive">Verifique as datas: o fim deve ser igual ou depois do início.</p>}
          </div>
          <aside className="h-fit space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">Resumo</h2>
            {q ? (
              <>
                <Row k={`${q.days} diária(s) × ${brl(q.daily)}`} v={brl(q.subtotal)} />
                {q.adjustment !== 0 && (
                  <Row k={q.adjustment > 0 ? "Taxa emergencial (+5%)" : `Desconto antecedência (${Math.round(q.adjustment * 100)}%)`} v={brl(q.total - q.subtotal)} />
                )}
                <div className="border-t border-border pt-3"><Row k="Total" v={brl(q.total)} bold /></div>
              </>
            ) : <p className="text-sm text-muted-foreground">Escolha pets e datas para ver o valor.</p>}
            <Button className="w-full" disabled={!canSubmit} onClick={submit}>{saving ? "Enviando..." : "Avançar"}</Button>
          </aside>
        </div>
      )}
    </PageShell>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className={`flex justify-between text-sm ${bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}><span>{k}</span><span>{v}</span></div>;
}
