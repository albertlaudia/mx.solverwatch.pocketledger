# media/marketing-site/

Assets for `pocketledger.app` (or `pocketledger.com`). See `/media/README.md` for specs.

**Contents** (when populated):
- `hero/` — hero image(s) for the landing page
- `og-image-1200x630.png` — Open Graph image for social shares
- `twitter-card-1200x675.png` — Twitter card image
- `favicon/` — favicon set (16, 32, 180 apple-touch-icon, 192 android-chrome, 512 pwa)

The marketing site itself is built with Next.js (in v1.5+) or a static Astro/11ty build (for v1.0). Either way, assets from this folder are imported as `import ogImage from '../../media/marketing-site/og-image-1200x630.png'`.

Epic 8 covers this — see `docs/07-production-roadmap.md`.
