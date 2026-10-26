import { createFileRoute } from "@tanstack/react-router";
import { EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: () => <EmptyCard>Preços, capacidade e horários. Em breve.</EmptyCard>,
});
