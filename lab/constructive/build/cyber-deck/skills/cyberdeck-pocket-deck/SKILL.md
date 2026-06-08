---
name: cyberdeck-pocket-deck
description: >
  Build the selfdriven.you "Pocket Deck" cyberdeck build guide — a single-page,
  self-contained HTML guide for assembling a palm-sized Raspberry Pi Zero 2 W
  terminal, styled in the selfdriven.you dark 4Cs system and structured as a
  four-mode build journey (Curious → Constructive → Caring → Chill). Use this skill
  whenever the user asks for a pocket deck, a tiny/handheld/minimal cyberdeck, a
  Raspberry Pi Zero build guide, a pocket terminal or "Pi in your pocket", an e-ink
  or headless Pi deck, or a small/low-power variant of the Field Deck. Trigger even
  if they just say "the small one" or "pocket variant" in a cyberdeck context. For
  the full-size Pi 5 portable build, use cyberdeck-field-deck instead.
---

# Cyberdeck — Pocket Deck Build Guide

Build a polished, single-page **HTML build guide** for a **Raspberry Pi Zero 2 W**
pocket deck — a palm-sized terminal you carry like a notebook. It is the small,
low-power sibling of the Field Deck: a thin client and writing/SSH machine, *not* a
desktop.

The deliverable is **one self-contained `.html` file** (inline CSS + JS, Google Fonts
CDN). A working reference build ships at `assets/cyberdeck-pocket-build-guide.html` —
**copy and adapt it** rather than starting fresh.

## Relationship to the Field Deck

This skill **inherits everything** from `cyberdeck-field-deck`: the selfdriven.you
dark 4Cs design system, the four-mode spine, and all guide-specific components (spec
strip, archetype grid, BOM table, step rail, code blocks, callouts, chill list) plus
the three mobile fixes (wordmark `.wm` wrap, hero `min-height:auto`, spec-strip 2×2
grid). **Read the `cyberdeck-field-deck` SKILL.md for those shared details and don't
duplicate them here.** This file documents only what's *different* for the Pocket Deck.

## What's different

### Positioning (set the reader's expectations honestly)

The Zero 2 W is a quad-core board with Wi-Fi + Bluetooth on board, ~512 MB RAM, **no
PCIe**, drawing ~1 W. Frame it as a **terminal / thin client**, not a desktop. If the
user wants a browser or a local model, steer them to the Field Deck (Pi 5). Matching
the deck to the job is itself a Curious-mode point.

### Accent tint

Where the Field Deck leads with Constructive mint, the Pocket Deck leans **Chill
violet** (`#9b8fff`) for its "small & calm" character:
- Hero gradient spans: amber→mint on line 1, **violet→rose** on line 2
- Hero pill dot, cursor dot, and the `.pick` table pill → violet
- Archetype tag + bullet markers → violet
- Code blocks and the primary CTA button **stay mint** (build identity is shared)

### Plan section — "pick a screen path" (not "pick a shape")

A pocket deck lives or dies on how you see the screen. Replace the shape archetypes
with three **screen paths**:
- **Path A · standalone** — 4–5" HDMI panel over mini-HDMI. Bright, fast, self-contained.
- **Path B · calm** — 2.9–4.2" e-ink over SPI. Days of battery, sunlight-readable, slow refresh.
- **Path C · headless** — no screen; drive it from a phone over SSH or its own hotspot.

Include a Curious callout explaining *why the Zero 2 W* (and its limits).

### Bill of materials (Pocket recipe)

Compute (Pi Zero 2 W) · Power + RTC (PiSugar-style clip-on board + LiPo) · Storage
(A2 microSD — **no NVMe**) · Display (4–5" HDMI panel *or* e-ink) · Keyboard (40% USB
or folding BT) · Adapters (**mini-HDMI→HDMI, micro-USB OTG** — the Zero uses the small
connectors) · Cooling (small stick-on heatsink, optional) · Enclosure (3D-printed
pocket case). Ballpark **$90–160**.

### Assembly steps (6, headless-first)

1. **Flash Pi OS Lite (64-bit)**, headless — no desktop, it's a terminal deck
2. **Fit the power add-on** — clip-on (no solder) or a bare LiPo board (a little solder); add heatsink
3. **First boot over SSH** — find it on the network, update, before any screen
4. **Wire screen & keyboard** — mini-HDMI adapter (Path A) or SPI e-ink driver (Path B); USB-OTG or BT keyboard
5. **Make the console pleasant** — `dpkg-reconfigure console-setup` for a readable font; `raspi-config` to enable SPI
6. **Close the pocket case** — balance the weight, expose power button + one USB port

The Constructive callout should push the **headless build tonight** ("a Zero you can
SSH into from your phone is already a pocket deck") — ship rough, learn what you want.

### Software loadout (Lite, terminal-first)

512 MB RAM rules out heavy apps — that's the gift. Text-mode tools:
```
sudo apt install -y tmux neovim git ranger micro
sudo apt install -y w3m openssh-client mosh
sudo apt install -y weechat syncthing
# optional: rtl-sdr tools if a radio dongle is clipped on
```
No `ollama` / local models here — that's a Field Deck capability.

### Tend & Live tweaks

- **Caring** — pocket-specific care: SD-card cloning (cards live hard), lithium safety on the LiPo, **strain-relief on screen/power cables** (the #1 pocket failure). Give back: publish the case STL and the display-driver setup notes.
- **Chill** — "one job, on purpose": a single-task device, the constraint as the feature, carry it like a notebook, "off is a valid state".

## Hardware accuracy — verify before every build

Web-search to confirm current Zero 2 W availability/price and any newer small board
before writing the BOM. As of early 2026 (re-verify): the Zero 2 W remains the small
flagship — quad-core, Wi-Fi/BT, ~512 MB RAM, mini-HDMI + micro-USB, no PCIe; runs cool
on ~1 W. Recommend Raspberry Pi OS Lite 64-bit (Debian 13 "Trixie" base).

## Output

- File: `cyberdeck-pocket-build-guide.html`
- Path: `/mnt/user-data/outputs/selfdriven-you/`
- Start from `assets/cyberdeck-pocket-build-guide.html`.
- Cross-link to the Field Deck: CTA ghost button → `cyberdeck-build-guide.html` ("← The full Field Deck guide").

## Checklist

- [ ] Inherits Field Deck design system, spine, components, and all 3 mobile fixes
- [ ] Positioned as a terminal/thin client (512 MB, no PCIe) — not a desktop
- [ ] Chill-violet accent lead; code + CTA stay mint
- [ ] "Pick a screen path" (HDMI / e-ink / headless) replaces shape archetypes
- [ ] Pocket BOM with mini-HDMI + micro-USB-OTG adapters called out; no NVMe
- [ ] 6 headless-first assembly steps; Pi OS **Lite** 64-bit
- [ ] Terminal-first loadout; no local model
- [ ] Strain-relief + lithium safety in Caring
- [ ] Zero 2 W availability/price web-verified
- [ ] Cross-linked back to the Field Deck guide
