-- has_role() is SECURITY DEFINER and EXECUTE is granted to `authenticated`, so
-- PostgREST exposes it at /rest/v1/rpc/has_role. Any signed-in user could POST
-- an arbitrary _user_id and read back a boolean — an oracle for enumerating who
-- holds the 'admin' role (and any future role).
--
-- Revoking EXECUTE is NOT an option: five RLS policies call has_role() in their
-- USING clause, policy expressions run as the querying role, and revoking makes
-- every one of them fail with "permission denied for function has_role".
-- Verified against production in a rolled-back transaction.
--
-- Instead, scope the answer to the caller. Every policy calls
-- has_role(auth.uid(), ...) so they are unaffected, while a probe for someone
-- else's roles now returns false rather than the truth.
--
--   auth.uid() IS NULL  → service_role / postgres / cron: answer truthfully,
--                         these already bypass RLS and need real semantics.
--   _user_id = auth.uid() → the caller asking about themselves: truthful.
--   otherwise             → false.

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
  AND (auth.uid() IS NULL OR _user_id = auth.uid())
$function$;

COMMENT ON FUNCTION public.has_role(uuid, app_role) IS
  'Role check for RLS policies. Scoped to the caller: a signed-in user asking '
  'about another user always gets false, so the PostgREST RPC endpoint cannot '
  'be used to enumerate role holders. service_role/postgres get true semantics.';
