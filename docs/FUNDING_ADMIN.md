# Funding administration

`/admin` → **Funding** tab (`src/components/admin/FundingManagement.tsx`),
visible to users with the `admin` role in `user_roles`.

- **Catalogue**: every record (published and not), search and status filter,
  publish / unpublish with confirmation (a record with no evidence on file is
  refused publication), an editor for the material fields (name, funder,
  description, type, repayability, amounts, intake, dates, provinces,
  eligibility, exclusions, source and apply URLs, link type, method,
  verification status and notes), **Mark verified today** (requires a
  verification note), the evidence quotes on file, and the record's history.
- **Review queue**: open items from research (`new_record`), the link
  checker (`dead_link`, `deadline_passed`) and public reports; resolve or
  dismiss with a note.
- **Link checks**: the weekly checker's results with verdicts.
- **Reports**: public "Report a problem" submissions.
- **Outbound clicks**: aggregate counts per programme, last 30 days.

Every publish, unpublish, verify and edit writes a
`funding_verification_events` row with the acting user. There is no delete:
retire a record with status `retired` and unpublish it.

Prerequisite: an admin row.

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = '<owner email>';
```
