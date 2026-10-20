# Proposal: self-serve account deletion (store requirement)

**Status: proposal, not implemented.** Nothing here is deployed. It needs a product
decision (section 2) before it becomes an Edge Function and a migration.

## 1. Why this blocks the app stores

Today both the website (`/dashboard/settings`) and the app (Account tab) offer
deletion as an **emailed request** to help@indigenousrising.ai. That matched
the web's "honest request path until self-serve deletion ships" note, but:

- Apple App Review Guideline 5.1.1(v): apps that support account creation must
  let users **initiate deletion from within the app**. A support email is only
  accepted for highly regulated industries.
- Google Play "Account deletion" policy: an in-app path **and** a web URL where
  a user can request deletion, both declared in Data safety.

So the app cannot be submitted until deletion works in-app, and the Play listing
needs a public web page for it.

## 2. The decision that is still open

Every user-owned table cascades from `auth.users` (per the web's own comment in
`Settings.tsx`), so a service-role `auth.admin.deleteUser(id)` would already
remove the account and its data cleanly. The one thing it would do badly is
**community content**:

| table | columns | cascade today | problem |
| --- | --- | --- | --- |
| `community_posts` | `user_id`, `display_name`, `title`, `body` | deletes the post | tears holes in threads other members are reading |
| `community_comments` | `user_id`, `display_name`, `body` | deletes the comment | same |
| `audit_logs` | `user_id` | SET NULL | fine, trail kept and anonymised |

Options:

- **A. Anonymise, keep text** — set `display_name = '[account removed]'` and
  `user_id = NULL` on the user's posts and comments, then delete the user.
  Threads stay readable. This is the usual forum convention.
- **B. Delete everything** — accept the holes. Simplest, strongest privacy
  posture, worst for other members.
- **C. Let the user choose** at deletion time (a checkbox). Most work.

OCAP framing: the words in a post are the member's; the thread they sit in is
the community's. Option A keeps the community's thread while removing the
member's identity. It needs `community_posts.user_id` / `community_comments.user_id`
to be nullable (check before writing the migration).

## 3. Implementation once decided (Option A shown)

Migration (append-only, timestamped):

```sql
alter table public.community_posts    alter column user_id drop not null;
alter table public.community_comments alter column user_id drop not null;
```

Edge Function `delete-account` (service role; verifies the caller's JWT and only
ever deletes the caller):

```ts
// supabase/functions/delete-account/index.ts  (draft)
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const auth = req.headers.get('Authorization') ?? '';
  const anon = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: { user }, error } = await anon.auth.getUser();
  if (error || !user) return Response.json({ error: 'unauthorized' }, { status: 401 });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const anonymise = { display_name: '[account removed]', user_id: null };
  await admin.from('community_posts').update(anonymise).eq('user_id', user.id);
  await admin.from('community_comments').update(anonymise).eq('user_id', user.id);
  await admin.from('audit_logs').insert({ user_id: null, action: 'account_deleted', entity_type: 'user', entity_id: user.id });
  const { error: delErr } = await admin.auth.admin.deleteUser(user.id);
  if (delErr) return Response.json({ error: delErr.message }, { status: 500 });
  return Response.json({ ok: true });
});
```

Clients:

- **App** (`mobile/src/app/(tabs)/settings.tsx`): replace the mailto alert with a
  two-step confirmation (type DELETE), call `callFunction('delete-account')`,
  then `signOut()`.
- **Web** (`Settings.tsx`): same function behind the existing card.
- **Web page for Google Play**: `/account/delete` (public, explains the steps and
  links to sign in → Settings), referenced in the Data safety form.

Also keep the emailed path for people who have lost access to the app.

## 4. Verification before submission

1. Two-account RLS test: user A cannot trigger deletion of user B (the function
   ignores any body; it only reads the JWT).
2. Delete a throwaway account; confirm `profiles`, `business_plans`,
   `funding_saved_matches`, `subscriptions` rows are gone, community rows are
   anonymised, and Stripe has no live subscription (cancel first or refuse
   deletion while `subscriptions.status = 'active'`, a second decision).
3. Confirm the audit row exists with `user_id` NULL.
