# /media/ — PocketLedger brand & store assets

> All icon, screenshot, and marketing assets live here. This directory is **gitignored** — assets are large, binary, and versioned through the design tool, not git. Use this README as the source of truth for what goes where.

## Why /media/ is gitignored

- Icons and screenshots are binary (PNG, JPG, SVG) — git is bad at them.
- Designs live in Figma; exporting to git every change is noise.
- Marketing assets get reviewed and replaced out-of-band from code.
- A 50MB iOS icon set should not bloat the repo on every clone.

## Folder structure

```
media/
├── README.md                              ← you are here
├── brand/
│   ├── logo/
│   │   ├── pocketledger-logo-primary.svg
│   │   ├── pocketledger-logo-inverse.svg
│   │   ├── pocketledger-mark.svg          ← icon mark, 1024x1024 source
│   │   ├── pocketledger-mark-512.png
│   │   ├── pocketledger-mark-256.png
│   │   └── pocketledger-mark-128.png
│   ├── wordmark/
│   │   └── pocketledger-wordmark.svg
│   ├── colors/
│   │   └── pocketledger-color-tokens.json ← design tokens (mirrors packages/ui/lib/src/tokens/)
│   └── fonts/
│       ├── inter-regular.ttf
│       ├── inter-medium.ttf
│       └── inter-semibold.ttf
│
├── app-store/
│   ├── icon/
│   │   ├── app-icon-1024.png              ← App Store Connect source (1024x1024, no alpha, sRGB)
│   │   └── README.md                      ← generation + export notes
│   ├── screenshots/
│   │   ├── iPhone-6.7-inch/               ← iPhone 14 Pro Max, 15 Pro Max, 15 Plus
│   │   │   ├── 01-home.png                ← 1290x2796 px
│   │   │   ├── 02-chat.png
│   │   │   ├── 03-check-in.png
│   │   │   ├── 04-goals.png
│   │   │   └── 05-export.png
│   │   ├── iPhone-6.5-inch/               ← iPhone 11 Pro Max, XS Max
│   │   │   ├── 01-home.png                ← 1242x2688 px
│   │   │   └── ...
│   │   ├── iPhone-5.5-inch/               ← iPhone 8 Plus
│   │   │   └── ...
│   │   └── iPad-12.9-inch/                 ← iPad Pro 12.9" (3rd gen+)
│   │       └── ...
│   ├── metadata/
│   │   ├── app-store-description.txt      ← 4000 char limit
│   │   ├── app-store-subtitle.txt         ← 30 char limit
│   │   ├── app-store-keywords.txt         ← 100 char limit, comma-separated
│   │   ├── privacy-policy-url.txt          ← required URL
│   │   ├── support-url.txt
│   │   └── marketing-url.txt
│   └── store-listing-screenshots/         ← the 10 promo screenshots in 1290x2796
│       ├── 01-cover.png
│       ├── 02-your-model-your-phone.png
│       ├── 03-on-device-only.png
│       └── ...
│
├── play-store/
│   ├── icon/
│   │   ├── launcher-icon-512.png          ← Play Console source (512x512, 32-bit)
│   │   ├── feature-graphic-1024x500.png   ← Play Console feature graphic
│   │   └── README.md
│   ├── screenshots/
│   │   ├── phone/                         ← 1080x1920 minimum
│   │   │   ├── 01-home.png
│   │   │   ├── 02-chat.png
│   │   │   └── ...
│   │   └── tablet-7-inch/                 ← 1200x1920 minimum
│   │       └── ...
│   ├── metadata/
│   │   ├── play-store-short-description.txt   ← 80 char limit
│   │   ├── play-store-full-description.txt    ← 4000 char limit
│   │   ├── data-safety-form.json             ← the actual Data Safety form submission
│   │   ├── content-rating.json
│   │   └── privacy-policy-url.txt
│   └── store-listing-graphics/            ← feature graphic + promo
│       └── ...
│
├── marketing-site/                        ← pocketledger.app assets
│   ├── hero/
│   ├── og-image-1200x630.png
│   ├── og-image-fallback.png
│   ├── twitter-card-1200x675.png
│   └── favicon/
│       └── favicon-32.png
│
└── pitch-deck/                            ← 24-slide deck media
    ├── speaker-photos/
    ├── demo-recordings/
    │   └── day-0-90-second-prototype.mp4
    └── supporting-graphics/
```

## iOS App Store icon specs

| Property | Spec |
|---|---|
| Filename | `media/app-store/icon/app-icon-1024.png` |
| Dimensions | 1024 × 1024 px |
| Color space | sRGB (not P3 — App Store doesn't accept it) |
| Bit depth | 8-bit RGB |
| Alpha channel | **None** — App Store rejects PNGs with alpha |
| Format | PNG (lossless) |
| File size | < 5 MB |
| Corner radius | **None** — iOS applies the rounded mask automatically |
| Naming | `app-icon-1024.png` is the source; Xcode generates all other sizes |

**Generation**:
1. Design at 1024×1024 in Figma (square, no rounding).
2. Export PNG, sRGB, no alpha.
3. Drop into Xcode asset catalog as `AppIcon` (universal, 1024×1024 slot).
4. Xcode auto-generates all home-screen sizes.

**Review**: Apple rejects icons with alpha, P3 color, or transparent backgrounds. Verify with `sips -g all media/app-store/icon/app-icon-1024.png` on macOS.

## iOS App Store screenshot specs (mandatory)

| Device class | Dimensions | Notes |
|---|---|---|
| iPhone 6.7" (15 Pro Max, 14 Pro Max) | 1290 × 2796 | **Required** for new submissions as of 2024 |
| iPhone 6.5" (11 Pro Max) | 1242 × 2688 | Optional but recommended |
| iPhone 5.5" (8 Plus) | 1242 × 2208 | Optional, for older device reach |
| iPad 12.9" (3rd gen+) | 2048 × 2732 | Required if iPad is a supported device |

**Count**: Up to 10 screenshots per device class.

**Content** (recommended 5-shot story arc):
1. **Home**: the chat-first home screen, "Speak / Snap / Chat" buttons visible.
2. **Chat**: a grounded chat answer with citations visible.
3. **Check-in**: the Sunday check-in card with top movers, goal progress, aura.
4. **Goals**: the goal upload + framework library.
5. **Export**: Daniel's accountant export in action (PDF preview).

Each screenshot needs:
- Status bar overlay: 9:41 AM, full battery, full signal.
- A 1-line headline caption overlaid (optional but recommended for store listing).
- No rounded corners — Apple applies the mask.

## Android Play Store icon specs

| Property | Spec |
|---|---|
| Filename | `media/play-store/icon/launcher-icon-512.png` |
| Dimensions | 512 × 512 px |
| Color space | sRGB |
| Bit depth | 32-bit (with alpha) |
| Format | PNG (lossless) |
| File size | < 1 MB recommended |
| Adaptive icon | Required for Android 8.0+ — separate foreground + background layers |

**Adaptive icon layers** (Android 8.0+):
- Foreground: 432×432 dp safe zone centered in a 1080×1080 dp canvas.
- Background: solid color or full-bleed image at 1080×1080 dp.
- Both live at `media/play-store/icon/adaptive/`.

## Android Play Store screenshot specs

| Type | Dimensions | Notes |
|---|---|---|
| Phone | 1080 × 1920 minimum | Aspect ratio between 9:16 and 16:9. PNG or JPEG. |
| 7-inch tablet | 1200 × 1920 minimum | Optional |
| 10-inch tablet | 1920 × 2560 minimum | Optional |
| Feature graphic | **1024 × 500** | **Required** — appears at the top of the Play Store listing. |

**Count**: Up to 8 phone screenshots + 8 tablet screenshots + 1 feature graphic.

## Privacy labels & data safety

**Apple App Store Privacy Label** (Apple's form, not a file):
- Data Not Collected → "Data Not Collected" label.
- Data Not Linked to You → required for the cloud sync.

**Google Play Data Safety form** (`media/play-store/metadata/data-safety-form.json`):
- The JSON we submit. Lists every data category (account info, financial info, etc.) and whether we collect, share, anonymize.
- PocketLedger's submission: **No data collected**, **No data shared**, **No data transferred off device** (for the free tier). For Pro cloud sync: only the encrypted ciphertext envelope is uploaded; we cannot decrypt it.

## Brand assets

| Asset | Use |
|---|---|
| `media/brand/logo/pocketledger-logo-primary.svg` | Marketing site, pitch deck cover, GitHub social preview |
| `media/brand/logo/pocketledger-logo-inverse.svg` | Dark mode UIs, app launch screen on dark theme |
| `media/brand/logo/pocketledger-mark.svg` | App icon source, favicon source, watermark on share-card |
| `media/brand/wordmark/pocketledger-wordmark.svg` | Marketing site footer, pitch deck end slide |
| `media/brand/colors/pocketledger-color-tokens.json` | Mirrors `packages/ui/lib/src/tokens/`. Used by designers. |
| `media/brand/fonts/Inter-{Regular,Medium,SemiBold}.ttf` | Inter is our typeface. Material 3 default. |

## How to add new media

1. Drop the file in the right folder.
2. Update this README's folder structure if you added a new subfolder.
3. Reference the asset in code or copy: `media/app-store/icon/app-icon-1024.png` → `apps/ios/ios/Runner/Assets.xcassets/AppIcon.appiconset/app-icon-1024.png` (Xcode handles the rest).
4. **Do not commit the binary to git.** The repo-level `.gitignore` excludes `/media/`.

## How to share media with collaborators

Use one of:

- **Figma**: the design team keeps the master files; export and drop into `/media/`.
- **Google Drive / Dropbox**: for cross-team handoff.
- **S3 bucket**: `s3://pocketledger-media-<env>/` with versioning enabled. CI downloads at build time.

For Epic 9 (App Store submission), the release engineer copies from `/media/` into the Xcode asset catalog and the Play Console upload directory, then runs the build verification script.

## Versioning policy

- Icons only get bumped on a major rebrand.
- Screenshots get a new folder: `media/app-store/screenshots/iPhone-6.7-inch/v0.1.0/`, `v0.2.0/`, etc. — keeps history.
- Marketing-site hero images get a date stamp: `hero-2026-07-18.png`.
- The release engineer picks the right version of each asset for the right release tag.

## See also

- `docs/07-production-roadmap.md` — Epic 8 (marketing site + waitlist + privacy whitepaper) and Epic 9 (TestFlight + Play Store submission).
- `docs/03-architecture.md` §9.4 — the model update channel (relevant for app icons when the brand evolves with model names).
- `production/monorepo-scaffold/analysis_options.yaml` — for the design tokens used in code (mirrored in `media/brand/colors/`).
