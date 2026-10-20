# Store assets

Generated from the brand kit (`brand/03-application`, `public/logo-icon.png`); no photography, no cultural motifs.

| File | Store | Spec |
| --- | --- | --- |
| `app-store-icon-1024.png` | App Store Connect | 1024×1024, RGB, no alpha (Apple rejects alpha). Normally taken from the build; upload only if asked. |
| `play-icon-512.png` | Google Play → Store listing | 512×512 PNG |
| `play-feature-graphic-1024x500.png` | Google Play → Store listing | 1024×500 PNG |

## Screenshots (not generated yet)

Must come from the real app, signed in, so they need a working account (the reviewer account).

| Store | Requirement | Simulator |
| --- | --- | --- |
| App Store | 6.9" iPhone: 1320×2868 (or 1290×2796), 3–10 images | `npx expo run:ios --device "iPhone 18 Pro Max"` |
| Google Play | Phone: at least 2, 16:9 or 9:16, min 320 px, max 3840 px | same simulator images are accepted |

Capture with `xcrun simctl io booted screenshot <file>.png`. Screens to use: sign-in, Home, Funding list, a programme detail, AI matches, Business plan, Account. Real screens only.
