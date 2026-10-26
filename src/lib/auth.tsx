import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = { session: Session | null; isAdmin: boolean; loading: boolean };
const AuthContext = createContext<AuthState>({ session: null, isAdmin: false, loading: true });

export async function checkIsAdmin(userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  return data === true;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, isAdmin: false, loading: true });

  useEffect(() => {
    const apply = (session: Session | null) => {
      setState((s) => ({ ...s, session, loading: false }));
      if (session) {
        // defer to avoid deadlocking inside the auth callback
        setTimeout(() => {
          checkIsAdmin(session.user.id).then((isAdmin) => setState((s) => ({ ...s, isAdmin })));
        }, 0);
      } else {
        setState((s) => ({ ...s, isAdmin: false }));
      }
    };
    const { data } = supabase.auth.onAuthStateChange((_e, session) => apply(session));
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
