import { createFileRoute } from "@tanstack/react-router";
import { EmptyCard, PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/pets")({
  head: () => ({
    meta: [
      { title: "Meus Pets · Lar de Patas" },
      { name: "description", content: "Veja e cadastre seus pets." },
      { property: "og:title", content: "Meus Pets · Lar de Patas" },
      { property: "og:description", content: "Veja e cadastre seus pets." },
    ],
  }),
  component: () => (
    <PageShell title="Meus Pets" subtitle="Listagem e cadastro dos seus pets.">
      <EmptyCard>Você ainda não cadastrou nenhum pet. O cadastro chega na próxima etapa.</EmptyCard>
    </PageShell>
  ),
});
