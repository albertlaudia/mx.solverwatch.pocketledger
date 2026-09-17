# media/play-store/

All assets for the Google Play Store submission. See `/media/README.md` for the full Android spec.

**Subfolders**:
- `icon/` — 512×512 PNG launcher icon + adaptive icon foreground/background (1080×1080)
- `screenshots/` — phone (1080×1920), 7" tablet, 10" tablet, up to 8 per class
- `metadata/` — Play Console text fields + Data Safety form JSON + content rating
- `store-listing-graphics/` — feature graphic (1024×500, **required**), promo graphics

**Submission** (Epic 9):
- Play Console → Store presence → Main store listing
- App content → Privacy & security → Data Safety form (mirror `metadata/data-safety-form.json`)
- Release → Production track → upload AAB
- Review → demo account (no account needed; reviewer uses onboarding flow)
