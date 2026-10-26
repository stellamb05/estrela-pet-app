import { createFileRoute } from "@tanstack/react-router";
import { EmptyCard, PageShell } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/booking")({
  head: () => ({
    meta: [
      { title: "Agendar · Lar de Patas" },
      { name: "description", content: "Escolha datas e finalize seu agendamento." },
      { property: "og:title", content: "Agendar · Lar de Patas" },
      { property: "og:description", content: "Escolha datas e finalize seu agendamento." },
    ],
  }),
  component: () => (
    <PageShell title="Agendar" subtitle="Calendário e checkout.">
      <EmptyCard>O calendário de agendamento chega na próxima etapa.</EmptyCard>
    </PageShell>
  ),
});
