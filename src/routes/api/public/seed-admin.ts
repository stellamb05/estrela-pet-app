import { createFileRoute } from "@tanstack/react-router";

// Idempotent admin seed. Caller must send header x-seed-token = SEED_ADMIN_PASSWORD.
export const Route = createFileRoute("/api/public/seed-admin")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const email = process.env.SEED_ADMIN_EMAIL;
        const password = process.env.SEED_ADMIN_PASSWORD;
        if (!email || !password) return Response.json({ error: "seed not configured" }, { status: 500 });
        if (request.headers.get("x-seed-token") !== password) {
          return Response.json({ error: "unauthorized" }, { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: "Administrador", phone: "" },
        });
        if (createErr && !/already|registered|exists/i.test(createErr.message)) {
          return Response.json({ error: createErr.message }, { status: 500 });
        }
        const { data, error } = await supabaseAdmin.rpc("promote_to_admin", { _email: email });
        if (error) return Response.json({ error: error.message }, { status: 500 });
        return Response.json({ ok: data === true });
      },
    },
  },
});
