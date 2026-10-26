import { createFileRoute } from "@tanstack/react-router";
import { EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/admin/kanban")({
  component: () => <EmptyCard>Quadro de agendamentos. Em breve.</EmptyCard>,
});
