import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Menu, PawPrint, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function SiteHeader() {
  const { session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const linkCls = "text-sm text-foreground/80 transition-colors hover:text-primary";
  const activeCls = { className: "text-sm text-primary font-semibold" };

  const links = (
    <>
      <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={activeCls} onClick={() => setOpen(false)}>Serviços</Link>
      <Link to="/pets" className={linkCls} activeProps={activeCls} onClick={() => setOpen(false)}>Meus Pets</Link>
      <Link to="/booking" className={linkCls} activeProps={activeCls} onClick={() => setOpen(false)}>Agendar</Link>
      {isAdmin && (
        <Link to="/admin" className={linkCls} activeProps={activeCls} onClick={() => setOpen(false)}>Área Admin</Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2 font-display text-lg text-foreground">
          <PawPrint className="h-5 w-5 text-primary" /> Lar de Patas
        </Link>
        <nav className="hidden items-center gap-8 md:flex">{links}</nav>
        <div className="hidden md:block">
          {session ? (
            <Button variant="ghost" size="sm" onClick={signOut}>Sair</Button>
          ) : (
            <Button asChild variant="outline" size="sm"><Link to="/auth">Entrar</Link></Button>
          )}
        </div>
        <button className="md:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-4 border-t border-border px-5 py-4 md:hidden">
          {links}
          {session ? (
            <Button variant="ghost" size="sm" className="justify-start px-0" onClick={signOut}>Sair</Button>
          ) : (
            <Link to="/auth" className={linkCls} onClick={() => setOpen(false)}>Entrar</Link>
          )}
        </nav>
      )}
    </header>
  );
}
