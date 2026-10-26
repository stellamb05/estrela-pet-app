import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { checkIsAdmin } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    if (!(await checkIsAdmin(context.userId))) throw redirect({ to: "/" });
  },
  head: () => ({
    meta: [
      { title: "Área Admin · Lar de Patas" },
      { name: "description", content: "Painel administrativo." },
      { property: "og:title", content: "Área Admin · Lar de Patas" },
      { property: "og:description", content: "Painel administrativo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Visão geral", exact: true },
  { to: "/admin/kanban", label: "Kanban" },
  { to: "/admin/reports", label: "Relatórios" },
  { to: "/admin/settings", label: "Configurações" },
] as const;

function AdminLayout() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl text-foreground">Área Admin</h1>
      <nav className="mt-6 flex gap-6 border-b border-border">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: "exact" in t }}
            className="-mb-px border-b-2 border-transparent pb-3 text-sm text-muted-foreground hover:text-foreground"
            activeProps={{ className: "-mb-px border-b-2 border-primary pb-3 text-sm text-foreground font-semibold" }}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8"><Outlet /></div>
    </main>
  );
}
