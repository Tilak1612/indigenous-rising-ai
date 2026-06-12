-- Security-advisor hardening for SECURITY DEFINER / trigger functions.
--
-- 1) Pin search_path. Every flagged function references either no tables or
--    only schema-qualified objects (public.profiles, public.community_posts),
--    so an empty search_path is behavior-preserving and removes the
--    search_path-injection surface. (Verified live: signup still creates the
--    profile row via the handle_new_user trigger after this change.)
alter function public.handle_new_user() set search_path = '';
alter function public.update_post_reply_count() set search_path = '';
alter function public.update_post_upvotes() set search_path = '';
alter function public.update_updated_at() set search_path = '';
alter function public.update_updated_at_column() set search_path = '';

-- 2) Remove the API-exposed EXECUTE grant from the trigger functions. They run
--    via triggers (which do NOT check EXECUTE) and are not invoked via RPC
--    anywhere in the app, so this only closes the direct /rest/v1/rpc surface.
--
--    has_role() is intentionally NOT revoked: it is evaluated inside RLS
--    policies, where revoking EXECUTE from `authenticated` would break access.
--    It only returns a boolean for given inputs, so direct callability is not
--    a meaningful disclosure.
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.update_post_reply_count() from anon, authenticated, public;
revoke execute on function public.update_post_upvotes() from anon, authenticated, public;
