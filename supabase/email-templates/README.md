# Email templates

55 lifecycle templates. **Not yet wired to triggers** — see step 5 of the
sequencing in the funding-verification migration.

## Escaping

Every variable uses `{{name}}` — **escaped**. The one exception is
`{{{company_postal_address}}}`, which is operator-set (never user-set) and
legitimately carries `<br>` line breaks.

These arrived using triple-brace `{{{name}}}` throughout — **321 variables
across all 55 files**. In Handlebars/Mustache triple-brace means *unescaped*,
so user-controlled values would have rendered as raw HTML in email:
`{{{first_name}}}` alone appeared 46 times, alongside `{{{organization_name}}}`,
`{{{contact_name}}}`, `{{{message_excerpt}}}` and `{{{application_name}}}`.
A display name containing markup would have been injected verbatim.

Converted to escape-by-default. **Do not reintroduce triple-brace** without a
specific reason, and never for a value a user can set.

## CASL

Templates without an unsubscribe link are the transactional and security ones
(`auth-*`, `billing-*`, `ai-generation-failed`). That is correct — CASL exempts
them, and per the `user_preferences.notifications` comment this class of mail
must never consult notification preferences.
