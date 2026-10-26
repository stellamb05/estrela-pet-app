<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Roles live in `public.user_roles` and are checked via `has_role()`; new signups get `cliente` from the `handle_new_user` trigger — never store roles on profiles (privilege escalation).
- Signed-in pages live under `src/routes/_authenticated/`; admin pages under `_authenticated/admin/` whose layout re-checks the admin role in `beforeLoad`.
- Form validation rules live in `src/lib/validation.ts` with tests in `src/test/validation.test.ts`, so client rules stay in one tested place.
