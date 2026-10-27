import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell, EmptyCard } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/pets")({
  head: () => ({
    meta: [
      { title: "Meus Pets · Lar de Patas" },
      { name: "description", content: "Veja e cadastre seus pets." },
      { property: "og:title", content: "Meus Pets · Lar de Patas" },
      { property: "og:description", content: "Veja e cadastre seus pets." },
    ],
  }),
  component: PetsPage,
});

type Pet = Tables<"pets">;
const empty = { name: "", type: "dog" as "dog" | "cat", is_sociable: null as boolean | null, medical_notes: "", routine_notes: "", emergency_contact: "" };

function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("pets").select("*").eq("active", true).order("created_at");
    setPets(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Informe o nome do pet");
    if (form.is_sociable === null) return setError("Responda se o pet é sociável com outros animais");
    setError(""); setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const payload = { ...form, name: form.name.trim(), is_sociable: form.is_sociable };
    const res = editing
      ? await supabase.from("pets").update(payload).eq("id", editing)
      : await supabase.from("pets").insert({ ...payload, profile_id: u.user!.id });
    setSaving(false);
    if (res.error) return toast.error("Não foi possível salvar o pet");
    toast.success(editing ? "Pet atualizado" : "Pet cadastrado");
    setForm(empty); setEditing(null); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("pets").update({ active: false }).eq("id", id);
    if (error) return toast.error("Não foi possível remover");
    load();
  };

  const edit = (p: Pet) => {
    setEditing(p.id);
    setForm({ name: p.name, type: p.type as "dog" | "cat", is_sociable: p.is_sociable, medical_notes: p.medical_notes ?? "", routine_notes: p.routine_notes ?? "", emergency_contact: p.emergency_contact ?? "" });
  };

  const choice = (active: boolean) => (active ? "default" : "outline") as const;

  return (
    <PageShell title="Meus Pets" subtitle="Cadastre e gerencie seus pets.">
      <div className="grid gap-8 md:grid-cols-2">
        <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">{editing ? "Editar pet" : "Novo pet"}</h2>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <div className="flex gap-2">
              <Button type="button" variant={choice(form.type === "dog")} onClick={() => setForm({ ...form, type: "dog" })}>Cachorro</Button>
              <Button type="button" variant={choice(form.type === "cat")} onClick={() => setForm({ ...form, type: "cat" })}>Gato</Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Sociável com outros animais? *</Label>
            <div className="flex gap-2">
              <Button type="button" variant={choice(form.is_sociable === true)} onClick={() => setForm({ ...form, is_sociable: true })}>Sim</Button>
              <Button type="button" variant={choice(form.is_sociable === false)} onClick={() => setForm({ ...form, is_sociable: false })}>Não</Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="med">Observações médicas</Label>
            <Textarea id="med" maxLength={1000} value={form.medical_notes} onChange={(e) => setForm({ ...form, medical_notes: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rot">Rotina</Label>
            <Textarea id="rot" maxLength={1000} value={form.routine_notes} onChange={(e) => setForm({ ...form, routine_notes: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="em">Contato de emergência</Label>
            <Input id="em" maxLength={120} value={form.emergency_contact} onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{editing ? "Salvar" : "Cadastrar"}</Button>
            {editing && <Button type="button" variant="ghost" onClick={() => { setEditing(null); setForm(empty); }}>Cancelar</Button>}
          </div>
        </form>
        <div className="space-y-3">
          {pets.length === 0 ? <EmptyCard>Você ainda não cadastrou nenhum pet.</EmptyCard> : pets.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
              <div>
                <p className="font-semibold text-foreground">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.type === "dog" ? "Cachorro" : "Gato"} · {p.is_sociable ? "Sociável" : "Não sociável"}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => edit(p)}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>Remover</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
