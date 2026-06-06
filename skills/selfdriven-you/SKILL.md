---
name: selfdriven-you
description: >
  Build selfdriven.you ecosystem pages, components, merch, and identity tools.
  Use when the user mentions selfdriven.you, the four modes (Curious / Caring /
  Constructive / Chill), the 4Cs design system, the where-you-at page, the
  identity builder, or any selfdriven.you branded asset (wallpapers, t-shirts,
  focus modes, KERI identity setup).
---

# selfdriven.you Ecosystem

**selfdriven.you** is a personal operating system for the age of intelligence, built on four
sustainable modes: **Curious · Caring · Constructive · Chill**. It is a distinct product from the
selfdriven Foundation (different design system, different fonts, different palette).

> Tagline: "A sustainable rhythm for living a fully human life in the age of intelligence."
> Parent: [selfdriven Foundation](https://selfdriven.foundation)
> Live site: [selfdriven.you](https://selfdriven.you)

---

## Trigger Contexts

Use this skill for any mention of:

- selfdriven.you (the site or product)
- The four modes: Curious, Caring, Constructive, Chill
- The 4Cs, the cycle, the rhythm, the mode wheel
- Where you at? / vibe check / where-you-at-apply
- selfdriven.you branded assets: wallpapers, t-shirts, merch, posters, iOS/Android Focus setups
- The identity builder page, KERI/WebAuthn passkey onboarding for selfdriven.you users
- Any page, component, or copy using the dark 4Cs design system described below

---

## Design System — Dark 4Cs Theme

This is the primary design system used across index.html, where-you-at-apply.html, and identity.html.
**Note:** where-you-at.html (the vibe-check page) uses a different neobrutalist/funky system — see the
exception section below.

### Design Tokens

```css
:root {
  --bg: #09090f;
  --surface: #111118;
  --surface2: #18181f;
  --border: rgba(255,255,255,0.08);
  --border2: rgba(255,255,255,0.14);
  --text: #f0eeff;
  --muted: #7e7a9a;
  --muted2: #3d3a55;

  /* Mode colours */
  --curious:      #f5c842;
  --caring:       #ff5f7e;
  --constructive: #00e5a0;
  --chill:        #7b6cff;
  --chill-bright: #9b8fff;   /* use for text on dark bg — #7b6cff is too dark */

  /* Dim variants (for pill fills, icon backgrounds) */
  --curious-dim:      rgba(245,200,66,0.13);
  --caring-dim:       rgba(255,95,126,0.13);
  --constructive-dim: rgba(0,229,160,0.13);
  --chill-dim:        rgba(123,108,255,0.13);

  --pill: 999px;   /* universal pill border-radius */
}
```

**Never use** the selfdriven Foundation accent `#C8442F` (flamingo) on selfdriven.you pages.
**Never use** Inter, Roboto, Poppins, or system fonts on selfdriven.you.

### Typography

```html
<!-- Google Fonts import — always use this exact string -->
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
```

| Role | Font | Weight | Notes |
|---|---|---|---|
| Display headings | Bricolage Grotesque | 800 | letter-spacing -0.04em |
| Sub-headings | Bricolage Grotesque | 700 | letter-spacing -0.03em |
| Body / UI | DM Sans | 400–600 | — |
| Code / identifiers | JetBrains Mono | 400–700 | AIDs, KEL events, technical labels |

**JetBrains Mono** is used for KERI AIDs, JSON/CESR code blocks, eyebrow step labels, and any
technical identifier. Load it alongside the main import when needed.

### Mode Icons (inline SVG `<symbol>`)

Always use these Lucide-style icons for the four modes. Use the `#ic-*` `<use>` reference pattern.

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="ic-telescope" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="17" cy="13" r="3"/><path d="M3 7l5.5 2.5"/><path d="M3 7l2-4 14.5 6.5-2 4"/>
    <path d="M8.5 9.5L6 20h5l1.5-4"/><path d="M17 16v4"/>
  </symbol>
  <symbol id="ic-heart" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </symbol>
  <symbol id="ic-hammer" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/>
    <path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/>
  </symbol>
  <symbol id="ic-waves" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
    <path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
  </symbol>
</svg>
```

| Mode | Icon ID | Colour | Essence |
|---|---|---|---|
| Curious | `#ic-telescope` | `#f5c842` | explore · ask · learn |
| Caring | `#ic-heart` | `#ff5f7e` | listen · hold space |
| Constructive | `#ic-hammer` | `#00e5a0` | build · ship · move |
| Chill | `#ic-waves` | `#9b8fff` | pause · breathe · reset |

---

## The Four Modes — Reference Content

### Mode 01 — Curious (amber `#f5c842`)

**Essence:** explore · ask · learn
**One line:** The mode that opens doors. Before you can care, build, or rest well, you have to notice what's actually there.

**Ideas:**
- Curiosity is a muscle, not a mood — it grows every time you act on a small question instead of letting it pass.
- "I don't know" is a starting line, not a verdict. Sit in it long enough to get interested.
- Follow the thing that makes you lean in, even slightly. That tug is data.

**Tasks:** 2 min — write down one question you've been avoiding; Today — ask someone a question you'd normally assume you know the answer to; This week — spend 30 minutes learning something with zero practical payoff.

### Mode 02 — Caring (rose `#ff5f7e`)

**Essence:** listen · hold space
**One line:** The mode that keeps everything human. Caring is attention before it's anything else.

**Ideas:**
- Caring is attention, not advice. Most people want to be heard before they want to be helped.
- You can hold space for someone without taking on their problem as your own.
- Check in on the person who always seems fine. "Fine" is often a closed door, not an open one.

**Tasks:** 2 min — send one message to someone with no ask attached; Today — ask one genuine follow-up question before responding with your own thing; This week — do one quiet uncredited thing for someone who won't know it was you.

### Mode 03 — Constructive (mint `#00e5a0`)

**Essence:** build · ship · move
**One line:** The mode that turns intention into something real. Momentum beats motivation.

**Ideas:**
- Done and rough beats perfect and imagined. You can't improve a thing that doesn't exist yet.
- Shrink the task until starting feels almost too easy — then start. Size is the enemy, not difficulty.
- Build in the open. Feedback early is cheap; feedback late is expensive.

**Tasks:** 2 min — name the single smallest next action on the stuck thing; Today — ship one rough version before you feel ready; This week — finish one thing that's been 90% done for too long.

### Mode 04 — Chill (violet `#9b8fff`)

**Essence:** pause · breathe · reset
**One line:** The mode that makes the other three sustainable. You can't pour from an empty cup, and you can't think from a fried one.

**Ideas:**
- Rest is part of the work, not a reward you earn after it.
- Your attention is a battery, not a tap. It runs down, and it needs charging.
- Doing nothing on purpose is a completely different thing from doing nothing by accident.

**Tasks:** 2 min — close your eyes and take ten slow breaths. That is the entire task.; Today — take one break with no screen in it; This week — block one hour that belongs to nothing at all.

---

## Components

### Hero Pill (status badge)

```css
.hero-pill {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(9,9,15,.55);
  border: 1px solid rgba(255,255,255,.22);
  border-radius: var(--pill); padding: 8px 18px;
  font-size: 12px; font-weight: 500; color: rgba(240,238,255,.7);
  letter-spacing: .08em; text-transform: uppercase;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.hero-pill .dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--constructive);
  animation: pulse 2s infinite;
}
```

**Critical:** the hero sits on a coloured gradient blob; the pill must have the dark semi-transparent
backing (`rgba(9,9,15,.55)`) + `backdrop-filter` so it reads clearly regardless of blob colour beneath it.

### Mode Pills (jump links / hero selectors)

These match the exact `.mode-pill` styling from the main index.html:

```css
.mode-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 11px 20px; border-radius: var(--pill);
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 14px; font-weight: 600;
  text-decoration: none; border: 1.5px solid transparent;
  transition: transform .2s, box-shadow .2s;
}
.mode-pill:hover { transform: translateY(-4px) rotate(-1.5deg); box-shadow: 0 14px 36px rgba(0,0,0,.5); }
.mp-c { background: var(--curious-dim); color: var(--curious); border-color: rgba(245,200,66,.28); }
.mp-k { background: var(--caring-dim);  color: var(--caring);  border-color: rgba(255,95,126,.28); }
.mp-b { background: var(--constructive-dim); color: var(--constructive); border-color: rgba(0,229,160,.28); }
.mp-l { background: var(--chill-dim);   color: var(--chill-bright); border-color: rgba(123,108,255,.28); }
```

**When pills sit over a bright hero gradient** (not on the dark main page), add a dark radial scrim
behind the pill row so all four read with equal contrast:

```css
.jump-row { position: relative; }
.jump-row::before {
  content: ''; position: absolute; inset: -30px -10%;
  background: radial-gradient(ellipse at center, rgba(9,9,15,.55), transparent 72%);
  z-index: -1; pointer-events: none;
}
```

### Glow Background Blobs

Animated, blurred ellipses that create the atmospheric ambient colour. Always four — one per mode.

```css
.gblob { position: absolute; border-radius: 50%; filter: blur(95px); opacity: .5; z-index: 0; }
.gb1 { width:520px; height:520px; background:var(--curious);      top:-150px; left:-160px; animation:gb 15s ease-in-out infinite; }
.gb2 { width:440px; height:440px; background:var(--caring);       top:40px; right:-130px;  animation:gb 19s ease-in-out infinite reverse; }
.gb3 { width:360px; height:360px; background:var(--constructive); bottom:-60px; left:18%;  animation:gb 23s ease-in-out infinite 3s; }
.gb4 { width:320px; height:320px; background:var(--chill);        bottom:20px; right:12%;  animation:gb 17s ease-in-out infinite 8s; }
@keyframes gb {
  0%,100% { transform: translate(0,0) scale(1); }
  40%      { transform: translate(34px,-26px) scale(1.08); }
  70%      { transform: translate(-22px,30px) scale(.93); }
}
```

### Custom Cursor

Always include on desktop; disable on touch devices.

```css
body { cursor: none; }
a    { cursor: none; }
.cursor-dot  { position:fixed; top:0; left:0; width:8px; height:8px; border-radius:50%; background:var(--curious); pointer-events:none; z-index:9999; transform:translate(-50%,-50%); transition:transform .12s ease,background .2s; }
.cursor-ring { position:fixed; top:0; left:0; width:34px; height:34px; border-radius:50%; border:1.5px solid rgba(240,238,255,.3); pointer-events:none; z-index:9998; transform:translate(-50%,-50%); transition:transform .18s ease,width .2s,height .2s; }
@media (hover:none) { body { cursor:auto } .cursor-dot,.cursor-ring { display:none } }
```

```javascript
// Cursor JS (always include)
(function(){
  var dot=document.getElementById('cdot'), ring=document.getElementById('cring');
  var rx=0,ry=0,dx=0,dy=0;
  document.addEventListener('mousemove',function(e){ dx=e.clientX; dy=e.clientY; dot.style.left=dx+'px'; dot.style.top=dy+'px'; });
  function loop(){ rx+=(dx-rx)*.18; ry+=(dy-ry)*.18; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); }
  loop();
  document.querySelectorAll('a,.task').forEach(function(el){
    el.addEventListener('mouseenter',function(){ ring.style.width='52px'; ring.style.height='52px'; ring.style.borderColor='rgba(245,200,66,.6)'; });
    el.addEventListener('mouseleave',function(){ ring.style.width='34px'; ring.style.height='34px'; ring.style.borderColor='rgba(240,238,255,.3)'; });
  });
})();
```

### Scroll Reveal

```css
.reveal { opacity:0; transform:translateY(28px); transition:opacity .6s,transform .6s cubic-bezier(.34,1.56,.64,1); }
.reveal.vis { opacity:1; transform:translateY(0); }
```

```javascript
const io = new IntersectionObserver(e=>e.forEach(x=>{ if(x.isIntersecting){ x.target.classList.add('vis'); io.unobserve(x.target); } }),{threshold:.14});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
```

---

## Page Inventory

| File | URL | Design system | Status |
|---|---|---|---|
| `index.html` | `/` | Dark 4Cs | Live — do not break |
| `where-you-at.html` | `/where-you-at` | Neobrutalist (see below) | Live — edit with care |
| `where-you-at-apply.html` | `/where-you-at-apply` | Dark 4Cs | Built this session |
| `identity.html` | `/identity` | Dark 4Cs + identity accent | Built this session |

### Page: index.html (main landing)

The canonical selfdriven.you page. Key elements:
- Nav: base64-embedded logo (`selfdriven<em>.you</em>`), mode pills, CTA
- Hero: two-line Bricolage 800 heading, subhead, animated glow blobs, mode pills
- Four mode sections with icon + pill + heading + body copy
- Cycle section (the four modes as a rotating rhythm)
- Practices section
- Podcast section ("Stop Your Autopilot" audio)
- Footer with download pills: wallpapers, iOS/Android focuses, merch artwork

**Logo:** embedded as `data:image/png;base64,...` — extract from index.html via:
```python
import re
LOGO = re.search(r'<img src="(data:image/png;base64,[^"]+)" alt="selfdriven\.you">', html).group(1)
```
Always reuse this extracted logo — do not re-embed a different one.

### Page: where-you-at.html ⚠️ DIFFERENT DESIGN SYSTEM

This page uses a **neobrutalist / funky light theme**. Do not apply the dark 4Cs tokens here.

```css
:root {
  --bg: #f5f0e6; --surface: #fff; --ink: #14110e;
  --muted: #6b5f52;
  --curious: #f5c842; --caring: #ff5c4d; --constructive: #4ade80; --chill: #6f8fff;
  --shadow-hard: 6px 6px 0 var(--ink);
  --shadow-hard-sm: 3px 3px 0 var(--ink);
}
@media (prefers-color-scheme: dark) {
  :root { --bg:#14110e; --surface:#1f1c18; --ink:#f5f0e6; --muted:#b0a89e; --border:#f5f0e6; }
}
```

Fonts: **Poppins** (900 weight body) + **Bricolage Grotesque** (brand/headings) + **JetBrains Mono** (labels).
Cards use `border: 2.5px solid var(--ink)` with hard box-shadow and slight rotations.
Mode buttons use full mode-colour fills with hard shadows.

The **"Where next?" block** added to this page follows this same neobrutalist style:
- White surface card, `6px 6px 0 var(--ink)` shadow, `0.5deg` rotation, hover lifts
- Rainbow gradient top stripe (5px, all four mode colours)
- Dark pill button with amber hover

### Page: where-you-at-apply.html

Follows on from the vibe check. Structure: hero → 4 mode sections → closing CTA → footer.

Per-mode sections have two columns:
- **Shift your thinking** — 3 ideas with sparkle icon (`#ic-sparkles`)
- **Do something now** — 3 task cards graded `2 minutes / Today / This week`

Mode-themed CSS classes: `.mode-c` (curious), `.mode-k` (caring), `.mode-b` (constructive), `.mode-l` (chill).

### Page: identity.html

KERI identity builder with an orange/amber identity accent:
```css
--identity: #e8724a;
--identity-dim: rgba(232,114,74,0.14);
--identity-glow: rgba(232,114,74,0.28);
```

Four-step wizard: Handle → Ed25519 key gen → Passkey + PRF encryption → Witnesses → Done.

Key security implementation (WebAuthn PRF — Option 2):
- Ed25519 key pair generated via `crypto.subtle.generateKey({name:'Ed25519'}, true, ['sign','verify'])`
- PKCS8 export → slice last 32 bytes = raw seed
- `navigator.credentials.create()` with `extensions.prf.eval.first = 'selfdriven-keri-v1'`
- PRF output → `importKey('raw', prfOutput, 'HKDF')` → `deriveKey` AES-256-GCM (non-extractable)
- AES-GCM encrypt(seed) → store `{encryptedSeed, iv, credentialId}` in IndexedDB
- Seed zeroed immediately: `rawSeed.fill(0); rawSeed = null;`
- Fallback (no PRF): re-import seed as non-extractable `CryptoKey`, store directly in IndexedDB

Browser PRF support (as of mid-2025): Chrome 118+, Edge 118+, Safari 17.4+. Firefox: not yet.

---

## Merch & Wallpaper Assets

### T-Shirt Designs

Print spec: **25×30cm @300dpi = 2953×3543 pixels**, transparent background (except glow + 80s which have baked backgrounds). DTG preferred for glow/gradient designs; screen printing requires flat ring-emblem design only.

| File | Description | Bg | Shirt |
|---|---|---|---|
| `selfdriven-tshirt-ring-dark.png` | Ring emblem (4 words inside cycle ring) | Transparent | Dark shirts |
| `selfdriven-tshirt-ring-light.png` | Ring emblem | Transparent | Light shirts |
| `selfdriven-tshirt-stack-dark.png` | Stacked colour type | Transparent | Dark shirts |
| `selfdriven-tshirt-stack-light.png` | Stacked colour type | Transparent | Light shirts |
| `selfdriven-tshirt-funky-dark.png` | Tilted words + sticker deco | Transparent | Dark shirts |
| `selfdriven-tshirt-funky-light.png` | Tilted words + sticker deco | Transparent | Light shirts |
| `selfdriven-tshirt-80s.png` | Synthwave — gradient sun, chrome type | **Baked** sky gradient | Any (full panel) |
| `selfdriven-tshirt-glow.png` | Ring emblem + per-word glow halos | **Baked** `#161310` | Dark shirts only |
| `selfdriven-tshirt-glow-white.png` | Ring emblem + soft colour auras | **Baked** `#fbf9f5` | White/light shirts |
| `selfdriven-tshirt-glow-transparent-fordark.png` | Glow, transparent, white wordmark | Transparent | Dark shirts |
| `selfdriven-tshirt-glow-transparent-forlight.png` | Glow, transparent, dark wordmark | Transparent | Light shirts |

**Vector path rendering** (font-independent, no font install needed):
```python
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
# Load from npm: npm pack @fontsource/bricolage-grotesque
# extract package/files/bricolage-grotesque-latin-800-normal.woff
font = TTFont('...woff'); upm = font['head'].unitsPerEm
# Each char → SVGPathPen → <path transform="translate(px*scale,0) scale(scale,-scale)" d="..."/>
```

**Glow filter (SVG):**
```xml
<filter id="gC" x="-70%" y="-70%" width="240%" height="240%">
  <feGaussianBlur stdDeviation="34" result="b"/>
  <feFlood flood-color="#f5c842" flood-opacity="0.55" result="f"/>
  <feComposite in="f" in2="b" operator="in"/>
</filter>
<!-- Note: no SourceGraphic merge — outputs glow-only so crisp shape can be layered on top -->
```

For transparent files: render glow layer + crisp layer separately. Two files needed per design
(fordark + forlight) because the wordmark must flip light/dark.

### Wallpapers

| File | Dimensions | Notes |
|---|---|---|
| `selfdriven-4cs-mobile.png` | 1290×2796 (iPhone Pro Max) | iOS lock screen safe — clock zone (y≈300–620) left empty |
| `selfdriven-4cs-mobile-android.png` | 1440×3120 | Android |

**iOS lock-screen constraint:** iOS clock renders at y≈300–620 (at 2796px height). Keep that zone clear. Start mode content at y≈940+.

### iOS/Android Focus Mode Guides

- iOS guide: PDF, dark 4Cs theme, manual-only (no schedules)
- iOS `.mobileconfig`: SVG-rendered icons per mode in true site colours, `shortcuts://run-shortcut?name=Go%20[Mode]` URLs as web clips
- Android guide: Pixel + Samsung One UI, two-column comparison format

---

## Technical Implementation

### PDF Rendering (Playwright)

```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.emulate_media(media='print')
    pg.goto(url)
    pg.pdf(path=out, prefer_css_page_size=True, print_background=True)
```

Page divs need `height: 297mm` and `overflow: hidden` (NOT `min-height`) to prevent overflow onto next page.

### Font Loading in Playwright/Chromium

Google Fonts URLs are blocked from the container. Use npm package instead:

```bash
npm pack @fontsource/bricolage-grotesque
tar -xzf *.tgz
# Use: package/files/bricolage-grotesque-latin-800-normal.woff
```

Load fonts system-wide before rendering:
```bash
cp *.woff /usr/local/share/fonts/
fc-cache -f
```

For GitHub raw TTF sources — codeload.github.com is on the allowlist.

### SVG → PNG

```python
import cairosvg
cairosvg.svg2png(url=svg_path, write_to=png_path, output_width=W, output_height=H)
# or
cairosvg.svg2png(bytestring=svg_str.encode(), write_to=png_path, output_width=W, output_height=H)
```

Install: `pip install cairosvg pillow --break-system-packages`

**Note:** cairosvg renders gradient-fill masks poorly — use clipPath + overlay radial gradient
fading TO bg colour instead of gradient on the shape itself.

### .mobileconfig Validation

```python
import plistlib
with open('profile.mobileconfig', 'rb') as f:
    plist = plistlib.load(f)
# Check structure, PayloadType, PayloadUUID etc.
```

### KERI Witness Service

Factory: `infrastructurefactory-keri-witness.js` (entityOS pattern).
Zero external KERI deps — all crypto via Node.js built-in `crypto`:
- Ed25519 verify/sign: DER-wrap raw key bytes, use `crypto.verify(null, msg, key, sig)`
- SAID computation: SHA-256 over compact JSON with dummy `d` field (`'#'*44`), `'E' + hash.toString('base64url').slice(0,43)`
- CESR key decode: `'A' + qb64.slice(1)` → base64url decode → drop first byte
- CESR sig decode (2-char `0B` prefix): `'AA' + qb64.slice(2)` → base64url decode → drop first 2 bytes
- Storage: DynamoDB, PK=`aid`, SK=`sn` (Number)

---

## Checklist

Before delivering any selfdriven.you output:

- [ ] Using `--bg: #09090f`, NOT `#f5f0e6` (Foundation) or `#1a160e` (tshirt bg)
- [ ] Bricolage Grotesque 800 for headings + DM Sans for body (not Poppins, not Inter)
- [ ] Four mode colours correct: amber `#f5c842`, rose `#ff5f7e`, mint `#00e5a0`, violet `#7b6cff` (text `#9b8fff`)
- [ ] Mode pills use dim fill + 1.5px border at `.28` opacity + `translateY(-4px) rotate(-1.5deg)` hover
- [ ] Hero pill has dark backing `rgba(9,9,15,.55)` + `backdrop-filter: blur(8px)` so it reads over gradient
- [ ] Mode icons are telescope / heart / hammer / waves (NOT compass / handshake / flask / moon)
- [ ] Logo extracted from existing index.html (not regenerated or substituted)
- [ ] Custom cursor: `cursor:none` on body + dot/ring JS; disabled via `@media(hover:none)`
- [ ] Glow blobs: four ellipses, one per mode, `filter:blur(95px)`, `opacity:.5`, animated
- [ ] Scroll reveal: `.reveal` / `.vis` via `IntersectionObserver`
- [ ] Nav: fixed, `rgba(9,9,15,.72)` backing, `backdrop-filter:blur(18px)`, border-bottom `var(--border)`
- [ ] where-you-at.html edits: use neobrutalist Poppins/hard-shadow style, NOT dark 4Cs tokens
- [ ] T-shirt files: 2953×3543px, glow designs need baked background, transparent designs need two files (fordark / forlight)
- [ ] KERI terminology: AID (not address), KEL (not log), SAID (not hash), `icp` / `rot` / `ixn` / `rct`
- [ ] `util-end` never registered inside a factory file — only in the Lambda/deploy bootstrap
