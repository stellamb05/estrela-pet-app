import { createFileRoute } from "@tanstack/react-router";
import { EmptyCard } from "@/components/PageShell";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: () => <EmptyCard>Visão geral do negócio. Em breve.</EmptyCard>,
});
