---
name: cyberdeck-field-deck
description: >
  Build the selfdriven.you "Field Deck" cyberdeck build guide — a single-page,
  self-contained HTML guide for assembling a portable Raspberry Pi 5 machine,
  styled in the selfdriven.you dark 4Cs system and structured as a four-mode
  build journey (Curious → Constructive → Caring → Chill). Use this skill whenever
  the user asks for a cyberdeck build guide, a Raspberry Pi portable/handheld
  computer guide, a "build log" page, a selfdriven hardware/maker guide, a BOM +
  assembly walkthrough for a Pi, or anything resembling the Field Deck. Trigger
  even if they say "Pi laptop", "rugged Pi deck", "DIY portable computer", or just
  "the deck guide" — this is the default Pi 5 build. For the tiny Pi Zero 2 W
  variant, use cyberdeck-pocket-deck instead.
---

# Cyberdeck — Field Deck Build Guide

Build a polished, single-page **HTML build guide** for a portable Raspberry Pi 5
"Field Deck" — a rugged, hand-made computer. The guide is a selfdriven.you property:
it sells the *idea* (owning your own machine as an act of agency) while delivering a
genuinely usable parts list, assembly walkthrough, and software setup.

The deliverable is **one self-contained `.html` file** (inline CSS + JS, fonts from
Google Fonts CDN). No build step, opens in any browser, prints cleanly.

A working reference build ships with this skill at
`assets/cyberdeck-build-guide.html` — **copy it and adapt rather than starting from
scratch.** It already encodes every layout fix and component below.

## Design system

This guide uses the **selfdriven.you dark 4Cs design system**. That system is the
source of truth — load the `selfdriven-you` skill for the full token set, fonts,
mode icons, glow blobs, custom cursor, and scroll-reveal patterns. Do **not** use
the selfdriven Foundation flamingo `#C8442F` palette here.

Quick reference (must match the selfdriven-you skill exactly):

- Background `#09090f`, surfaces `#111118` / `#18181f`, text `#f0eeff`, muted `#7e7a9a`
- Mode colours: Curious `#f5c842` · Caring `#ff5f7e` · Constructive `#00e5a0` · Chill `#7b6cff` (text `#9b8fff`)
- Fonts: **Bricolage Grotesque** 800 headings, **DM Sans** body, **JetBrains Mono** for code/labels/eyebrows
- Mode icons (inline `<symbol>`): telescope / heart / hammer / waves — never compass/flask/moon
- Custom cursor, four animated glow blobs (one per mode), `IntersectionObserver` `.reveal` → `.vis`
- Nav: fixed, `rgba(9,9,15,.72)` + `backdrop-filter:blur(18px)` on scroll

The Field Deck's accent through-line is **Constructive mint** (`#00e5a0`) — code
blocks, the primary CTA button, and the cursor dot all use it, signalling "build / ship".

## The four-mode spine

Every cyberdeck guide maps the build onto the selfdriven rhythm. Keep this exact
section order:

1. **Nav** — mark dots + `selfdriven.you` wordmark, four mode jump-pills, hidden under 620px
2. **Hero** — eyebrow `build log · raspberry pi`, two-line headline with gradient spans, lead, four jump-pills, spec strip
3. **Why build one** — thesis: a hand-built machine is sovereignty/agency; 3 cards (understand your tools / repairable / attention stays yours)
4. **Phase rail** — 4 cards introducing the modes as build phases
5. **01 · Curious — Plan it** — "pick a shape" archetype grid + "choose your Pi" comparison table + a Curious task callout
6. **02 · Constructive — Build it** — BOM table + numbered assembly step-rail + software loadout + code blocks + a Constructive task callout
7. **03 · Caring — Tend it** — two columns (keep it healthy / give back) + a Caring task callout
8. **04 · Chill — Live with it** — numbered "calm computing" list
9. **CTA** — rainbow-topped card, "Be curious. Build it. Be caring."
10. **Footer** — "Be Curious, Be Caring." + links

Each mode section opens with a `mode-banner` (coloured icon badge + `Mode 0N · Name`
eyebrow) and is separated by a thin `.rule` hairline. Tint each section's accents to
its mode colour (Curious=amber, Constructive=mint, Caring=rose, Chill=violet).

## Guide-specific components

These exist in the reference HTML; reuse them verbatim.

- **Spec strip** — 4-cell stat band under the hero (Build time / Skill floor / Ballpark / Soldering). Desktop = flex row; **mobile (≤640px) = 2×2 CSS grid** with internal cell borders. See the mobile fix below.
- **Archetype grid** — 3 cards for "pick a shape" (Pocket / Field / Desk deck), mono tag + bullet list.
- **Comparison table** — Pi model picker; `.pick` pill marks the recommended row.
- **BOM table** — Part / Pick / ~Cost / Notes; cost column in JetBrains Mono, mint.
- **Step rail** — `.step-card` grid `64px 1fr`, numbered badge, vertical connector line via `::before` (skip on last). Embed `.code` blocks inside steps where commands belong.
- **Code block** — `#0c0c14` bg, mint left-border, JetBrains Mono; `.cm` muted comments, `.cmd` mint commands.
- **Callout** — one per mode section, coloured icon chip + a concrete "<Mode> task" tying the build back to the mode's ethos.
- **Chill list** — numbered `01–04` rows for the Live-with-it philosophy.

### Critical mobile fixes (already baked into the asset — keep them)

These are real bugs that were found and fixed; do not regress them:

1. **Brand wordmark** — wrap the text in `<span class="wm">selfdriven<em>.you</em></span>`. The `.brand` is a flexbox with `gap`, so a bare text node + `<em>` get split by the gap, leaving an ugly space before `.you`. The wrapping span keeps it flush.
2. **Hero on mobile** — drop `min-height:92vh` to `auto` and `justify-content:flex-start` under 640px, or the hero leaves a large dead gap above the jump-pills on tall phones.
3. **Spec strip on mobile** — switch from `flex` to a 2-col grid under 640px with `nth-child` borders, so the four cells form a clean 2×2 instead of wrapping with uneven heights and stray borders.

## Content reference — the Field Deck recipe

The canonical build is a Pi 5 + 7" screen + mechanical keyboard + battery in a case.

**Pick a shape (archetypes):** Pocket Deck (Zero 2 W, tiny) · Field Deck (Pi 5, rugged, the default) · Desk Deck (Pi 5 8–16 GB, NVMe, mains-powered, self-hosting).

**Choose your Pi (table rows):** Pi 5 · 4 GB *(recommended)* · Pi 5 · 8–16 GB · Pi Zero 2 W · Pi 4 · 2–4 GB · Compute Module 5.

**Bill of materials (rows):** Compute (Pi 5 4 GB) · Cooling (Active Cooler — *not optional* on Pi 5) · Storage (NVMe + M.2 HAT+) · Backup microSD · Display (7" DSI/HDMI) · Keyboard (60% mechanical) · Power (UPS HAT + 2× 18650, **protected** cells) · Enclosure (3D print / rugged case) · Glue parts (cables, hub, standoffs) · Optional HUD (SDR/OLED/antenna).

**Assembly steps (8, in order):** 1 Flash OS first (headless Imager config) · 2 Mount Pi + cooler · 3 Add NVMe HAT · 4 Wire screen/keyboard/power · 5 Bench boot & update · 6 Boot from NVMe · 7 Close it up · 8 Power & thermal check.

**Key commands to include verbatim:**
```
sudo apt update && sudo apt full-upgrade -y
sudo rpi-eeprom-update -a
sudo raspi-config
sudo rpi-eeprom-config --edit      # BOOT_ORDER=0xf416  (NVMe → USB → SD)
vcgencmd measure_temp              # keep under ~80°C
vcgencmd get_throttled             # 0x0 = good
```

**Software loadout:** lean, offline-first, no-phone-home tools — `tmux neovim git ripgrep fzf`, `syncthing`, and optionally a small local model via `ollama` (8 GB+ Pi only).

## Hardware accuracy — verify before every build

Raspberry Pi pricing and the model lineup change frequently. **Web-search to refresh
prices and confirm the current flagship before writing the BOM.** Treat the values in
the reference HTML as a snapshot, not gospel.

As of early-2026 ground truth (re-verify):
- Pi 5 is the flagship (released Oct 2023): PCIe for NVMe, integrated RTC, in-house RP1 I/O chip. 4 GB is the sweet spot.
- RAM-driven price rises through early 2026 made 8/16 GB models noticeably pricier — size RAM to the job.
- Raspberry Pi OS is on Debian 13 "Trixie" (Wayland/labwc). Recommend the 64-bit build.
- Pi 5 **needs active cooling** and is happiest on a 5 V / 5 A (27 W) supply; smaller battery packs run it but may limit peripheral current — call this out for portable builds.
- Always recommend **protected** 18650 cells + a proper UPS/management board; never loose-cell charging unattended. Keep lithium safety in the Caring section.

## Variants & cross-linking

This skill is the **Field Deck (Pi 5)**. Its sibling is **cyberdeck-pocket-deck**
(Zero 2 W). When both guides exist in one output folder, cross-link them:
- Field Deck CTA ghost button → `cyberdeck-pocket-build-guide.html` ("Pocket Deck variant →")
- Pocket Deck CTA ghost button → `cyberdeck-build-guide.html` ("← The full Field Deck guide")

## Output

- File: `cyberdeck-build-guide.html`
- Path: `/mnt/user-data/outputs/selfdriven-you/`
- Start from `assets/cyberdeck-build-guide.html`, then adapt content/copy.
- Offer a print-ready PDF render afterwards (Playwright, print media) if the user wants a workbench copy.

## Checklist

- [ ] Self-contained HTML, opens with no build step
- [ ] selfdriven.you dark 4Cs tokens — NOT Foundation flamingo `#C8442F`
- [ ] Bricolage Grotesque + DM Sans + JetBrains Mono
- [ ] Four-mode spine in order; each section banner-led and mode-tinted
- [ ] Constructive mint as the build through-line (code, CTA, cursor)
- [ ] Brand wordmark wrapped in `.wm` (no flex-gap split)
- [ ] Hero `min-height:auto` + spec-strip 2×2 grid under 640px
- [ ] BOM costs web-verified; Pi lineup confirmed current
- [ ] Active cooling + 27 W supply + protected-cell safety called out
- [ ] Cross-linked to the Pocket Deck variant if present
