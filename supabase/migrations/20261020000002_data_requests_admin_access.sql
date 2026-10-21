-- The admin "Data requests" screen (src/components/admin/DataRequestsManagement.tsx)
-- reads and updates public.data_requests through the user's JWT, but the table
-- has RLS enabled with no policies at all, so every admin query returns nothing
-- and every update is a silent no-op. It also selects an assigned_to column
-- that was never created. Submissions come from the submit-data-request edge
-- function with the service role, which bypasses RLS, so inserts were fine.
--
-- Admin-only access, same has_role() pattern as the other admin tables. There
-- is deliberately no policy for ordinary users: a data request contains the
-- requester's name, email and phone and is handled by staff only.

alter table public.data_requests
  add column if not exists assigned_to uuid references auth.users(id) on delete set null;

create policy "Admins can view data requests"
  on public.data_requests for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update data requests"
  on public.data_requests for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));
