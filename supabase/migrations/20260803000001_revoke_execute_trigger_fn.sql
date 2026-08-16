-- Security hardening: stop a trigger function being callable as an RPC.
--
-- touch_support_tickets_updated_at() is a TRIGGER function, but it was exposed
-- via PostgREST at /rest/v1/rpc/touch_support_tickets_updated_at and executable
-- by BOTH anon and authenticated. It was the only SECURITY DEFINER trigger
-- function still granted EXECUTE — handle_new_user, update_post_reply_count and
-- update_post_upvotes already had it revoked, so this restores consistency.
--
-- Revoking EXECUTE does NOT affect trigger firing: triggers run in the context
-- of the table owner, not the calling role. Verified after applying — the
-- support_tickets trigger is still attached and active.
--
-- Note: has_role(uuid, app_role) intentionally REMAINS executable by
-- authenticated. It is the helper used inside RLS policies (audit_logs,
-- user_roles); revoking it would break admin access checks.

REVOKE EXECUTE ON FUNCTION public.touch_support_tickets_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.touch_support_tickets_updated_at() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_support_tickets_updated_at() FROM PUBLIC;
