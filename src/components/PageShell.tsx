import type { ReactNode } from "react";

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <main className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="text-3xl text-foreground">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="mt-8">{children}</div>
    </main>
  );
}

export function EmptyCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 text-center text-muted-foreground shadow-soft">
      {children}
    </div>
  );
}
