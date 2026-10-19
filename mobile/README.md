# Indigenous Rising — iOS and Android app

Expo (React Native) client for the Indigenous Rising AI platform. It signs in
against the same Supabase project as https://www.indigenousrising.ai and reads
and writes the same tables and Edge Functions, so nothing is duplicated: a plan
started on the web continues in the app, a programme saved in the app shows on
the web.

## What the app does today

| Area | Backed by |
| --- | --- |
| Sign in, sign up, password reset (email + password) | Supabase Auth |
| Home: profile nudge, upcoming deadlines, plan badge | `profiles`, `funding_saved_matches`, `check-subscription` |
| Funding catalogue with search, detail, official link | `grants` (published rows only, via RLS) |
| AI matches, on demand, with quota and profile handling | `match-funding-opportunities` Edge Function |
| Saved programmes | `funding_saved_matches` |
| Business plan, six sections, 2 s autosave | `business_plans.content` (same shape as the web) |
| Account: subscription status (read-only), data export, links | `subscriptions`, `check-subscription` |

Deliberately **not** in the app:

- Purchasing or changing a plan. Plans are sold through Stripe on the website;
  the app shows status and links to `/dashboard/plan`. In-app purchase would
  need Apple/Google products and a policy review first.
- Self-serve account deletion. The website offers an emailed request, and the
  app does the same. **Apple (5.1.1(v)) and Google Play require in-app account
  deletion**, so this must become a real Edge Function before store submission.
- Google sign-in, French UI, push notifications, training content: not yet.

## Commands

```bash
npm install                 # once
npx expo start              # dev server; press i for iOS simulator, a for Android
npx expo start --ios        # straight to the booted iOS simulator
npx tsc --noEmit            # typecheck
npx expo lint               # lint
npx expo-doctor             # dependency / config health
npx expo install <pkg>      # add a dependency (never npm add)
npx expo prebuild --clean   # regenerate ios/ and android/ (not committed)
npx expo run:ios            # local native iOS build + run
npx expo run:android        # local native Android build + run (needs Android SDK)
```

EAS (cloud builds; needs `eas login` and `eas init` once):

```bash
eas build --platform ios --profile preview        # internal iOS build
eas build --platform android --profile preview    # internal APK
eas build --platform all --profile production     # store builds
eas submit --platform ios                         # TestFlight / App Store Connect
eas submit --platform android                     # Google Play internal track
```

## Configuration

Copy `.env.example` to `.env` to override the Supabase URL/anon key. The anon key
is publishable by design; every table the app reads is behind row-level
security. Secrets never belong in this project.

Identifiers: iOS `ai.indigenousrising.app`, Android `ai.indigenousrising.app`,
URL scheme `indigenousrising`.
