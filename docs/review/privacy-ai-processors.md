# Review packet: AI processors in the privacy policy, and the data sovereignty questions guide

Status: **approved by the owner on 3 November 2026** ("Approved as written").
Answers to section 4: AI requests are described as processed on each provider's
servers, which may be outside Canada (both functions call the providers' global
endpoints; the owner chose this over a Canada claim the code does not support);
neither provider uses API data for training, and retention is left to each
provider's linked terms. Shipped with /guides/indigenous-business-data-sovereignty-questions.

## 1. What the code does today (read from the repo, 3 Nov 2026)

| Feature | Who uses it | Provider and model | What is sent | Stored by us |
|---|---|---|---|---|
| Funding matching, "Find my matches" (`supabase/functions/match-funding-opportunities`) | Signed-in members, on click | OpenAI API, `gpt-4o-mini` | Territory, industry, business stage, description and funding purpose from the business profile. No name, email or phone. | Match results, in our database |
| Member assistant, dashboard chat (`supabase/functions/ai-assistant`) | Signed-in members | OpenAI API, `gpt-4o-mini` | The last 16 messages of the conversation, plus published funding programmes for the member's territory as grounding. No other profile fields. | The conversation, in `ai_chat_messages` (owner-only access) |
| Site assistant, "Ask Agent" on public pages (`supabase/functions/site-assistant`) | Anyone, no account | Anthropic API, `claude-haiku-4-5` (overridable by `SITE_ASSISTANT_MODEL`) | The visitor's message and up to 8 earlier turns, 1,000 characters each. Account, billing and legal questions are answered without calling the model. | Not stored by the function. The IP address is used only for rate limiting and is not sent to Anthropic. |

## 2. The gap

The policy's "Third-Party Processors for AI Features" block names OpenAI for
funding matching only. It does not mention:

- that the member assistant also sends chat messages to OpenAI;
- that the public site assistant sends visitor messages to Anthropic.

Anything a member types into the chat leaves our systems, so the policy has to
say so.

## 3. Proposed replacement wording (for approval)

Replace the body of "Third-Party Processors for AI Features" in
`src/pages/PrivacyPolicy.tsx` with:

> We use two AI providers. Each receives only what is needed for the feature
> you are using, and only when you use it.
>
> **Funding matching (OpenAI).** When you click "Find my matches", we send your
> territory, industry, business stage, business description and funding purpose
> to OpenAI's API to generate recommendations. Your name, email and phone number
> are not sent.
>
> **Member assistant (OpenAI).** When you use the assistant in your dashboard,
> we send your recent messages in that conversation, and a list of published
> funding programmes for your territory, to OpenAI's API to write the reply. We
> keep the conversation in your account so you can return to it; only you can
> see it.
>
> **Site assistant (Anthropic).** When you use "Ask Agent" on our public pages,
> we send your message and the earlier messages in that chat to Anthropic's API
> to write the reply. We do not store these chats. Questions about accounts,
> billing or legal matters are answered by a set message without being sent to
> Anthropic.
>
> [OWNER TO CONFIRM, see section 4: where each provider processes data, and how
> long it keeps it.] Read OpenAI's
> [enterprise privacy commitments](https://openai.com/enterprise-privacy) and
> Anthropic's [privacy policy](https://www.anthropic.com/legal/privacy).
> Please do not enter information you would not want processed outside our own
> systems, such as personal health or financial account details.

## 4. Facts the owner must confirm before publishing

These depend on the account agreements, which are not in the repo, so they are
not stated above:

1. **Where processing happens.** Whether either provider processes data outside
   Canada (the default for both APIs is typically the United States). The site
   says business data is "stored in Canada"; the policy should say plainly that
   these AI requests are processed by the provider, and where.
2. **Retention.** The current text says OpenAI "does not retain data sent via
   their API for training purposes". Confirm that, and whether any retention for
   abuse monitoring applies, for both OpenAI and Anthropic under your accounts.
3. **Zero data retention.** Whether either account has a zero-retention
   arrangement. If so, say so; if not, do not imply it.

Separately, outside AI: the policy does not name the other processors the site
uses (Supabase hosting, Vercel, Stripe, Resend email, and the Sentry error
monitoring added in PR #250). That is a separate owner decision and is not part
of this draft.

## 5. Draft: /guides/indigenous-business-data-sovereignty-questions

Built only after section 3 is approved, so the guide and the policy say the same
thing. Planned title (59 characters): "Questions to Ask Before Using AI for an
Indigenous Business". The existing `/guides/what-is-ocap` stays the principles
explainer; this page is the practical checklist.

Sections:

1. **Why ask.** When you type business information into an AI tool, it may be
   sent to another company to process. Ask before you share anything a
   community has not agreed to share.
2. **Questions to ask any vendor**, each with "what a good answer looks like":
   - Where is my data stored, and where is it processed? (They can differ.)
   - Which other companies receive my data, for which feature?
   - Is anything I type used to train a model?
   - How long is it kept, by you and by each provider?
   - Can I export all of it, in what format?
   - Can I delete it, and what happens to copies held by providers?
   - Who on your side can see it?
   - What do you do if there is a breach, and how fast do you tell me?
3. **Questions for the community.** Who decides what community or Nation data
   may be entered into a tool; whether a data-sharing agreement or a council
   decision is needed; how the decision is recorded.
4. **First Nations, Inuit and Métis governance are distinct.** OCAP® is a
   First Nations framework (link the existing explainer). Inuit and Métis
   governing bodies have their own approaches; the page will name and link a
   framework only after reading its own source, and otherwise tell readers to
   ask the relevant governing body. *(Sources to read before publishing.)*
5. **How Indigenous Rising answers these questions.** Each answer taken from the
   approved policy wording in section 3 and from live features only: storage in
   Canada for accounts, plans and documents; the three AI features and their
   providers; self-serve account deletion (PR #248); export, only if confirmed
   live at the time of writing.

## 6. Approval

Reply with "approved" (or edits) for section 3 and the answers to section 4.
The policy change and the guide then ship together in one PR.
