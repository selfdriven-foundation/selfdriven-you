# Cyberdeck — foldable case (clamshell / mini-laptop)

A folding deck: the **base** cradles a keyboard with a Pi + battery bay behind it,
and the **lid** flips up to hold a screen. Joined by an interlocking **pin hinge**.

```
folding-deck-base.stl     keyboard well + Pi bay + hinge knuckles
folding-deck-lid.stl      screen pocket + window + hinge knuckles
folding-preview.png       parts, open view, and closed side-section
cyberdeck-folding-case.py parametric generator (edit + re-run)
```

**Folded size:** ~198 × 160 × 44 mm (each part prints flat on a 220 × 220 bed).

## How it works

- **Base** — a low-profile **keyboard well** (180 × 86 mm, keyboard ≤ ~12 mm tall) sits
  in the front. Behind a divider wall is the **Pi bay**: a Pi 5 mounts on the official
  58 × 49 pattern, with port openings out the back and right side, and bottom vents. A
  cable slot through the divider routes the keyboard's USB lead into the body.
- **Lid** — a frame with a 5 mm **pocket** for a ~165 × 103 mm screen module and a
  150 × 90 mm **window** cut through to show the panel. A slot by the hinge passes the
  display ribbon/HDMI down to the base.
- **Hinge** — 7 interlocking knuckles (4 on the base, 3 on the lid) share a single
  **3 mm pin**: a steel rod, a length of 3 mm filament, or a long M3 screw + nut.

## The hinge (read this)

Out of the box it's a **free-swinging** pin hinge — it folds, but won't hold the screen
at an angle on its own. To make it stay open, do one of:
- Slightly **oversize the pin** (e.g. 3.2–3.4 mm rod into the 3.2 mm channel) for friction;
- Add **nylon washers** between knuckles, or a smear of thick grease;
- Drop in a small **torque/friction hinge** insert instead of the plain pin;
- Or add a flip-out **kickstand** behind the lid.

The knuckle holes print at 3.2 mm — ream with a 3 mm drill for a smooth steel rod, or
leave as-is for filament/thread friction.

## Print settings

| Setting     | Recommendation |
|-------------|----------------|
| Material    | **PETG** (the hinge needs toughness — avoid brittle PLA here) |
| Layer height| 0.2 mm |
| Perimeters  | 4 (5 around the knuckles) |
| Infill      | 25–35 % |
| Base orient | Bottom on the bed, open side up — port cut-outs bridge fine |
| Lid orient  | Pocket side **up** (window bridges cleanly); or window-face down for a smoother screen face with light support |
| Supports    | Minimal — only the rear-wall port overhangs may want a touch |

Print the hinge knuckles with the pin axis **along the print bed (X)** as modelled, so
the barrel layers run around the pin — much stronger than printing them vertically.

## Fasteners (BOM)

- **Pi 5 → standoffs:** 4× M2.5 self-tapping screws (2.1 mm pilots modelled).
- **Hinge pin:** 1× 3 mm steel rod / filament / long M3 (≈ width of the case, ~196 mm; cut to fit).
- **Screen:** retained by the pocket + a bezel strip, clips, or VHB tape (panel-specific).
- **Keyboard:** seats in the well; the closed lid holds it down. Add foam tape if it rattles.

## Assembly

1. Print base + lid in PETG. Test-fit the knuckles; ream the pin channel if tight.
2. Mount the Pi 5 in the rear bay on the standoffs (M2.5).
3. Seat the keyboard in the front well; route its USB through the divider slot to the Pi.
4. Fit the screen into the lid pocket; pass its cable through the hinge-side slot to the Pi.
5. Interlock the base and lid knuckles and slide the **3 mm pin** through the full width.
6. Add friction (washers / oversize pin) so the lid holds its angle. Done.

## Reference model — verify before a final print

Sizes and the Pi 58 × 49 pattern are correct, but the **keyboard well, screen window
and ports are generous**, and screen/keyboard retention is intentionally left open
(those are part-specific). Fits a keyboard up to **180 × 86 × 12 mm** and a screen
module up to **~165 × 103 mm**. Dry-fit a knuckle test print before committing.

### Make it yours

`cyberdeck-folding-case.py` is parametric — edit `kb` (keyboard), `mod`/`win` (screen),
`rear` (bay depth), `Hb` (base height), or the hinge (`NK`, `PIN`, `hingeR`) at the top,
then re-run:

```
pip install trimesh manifold3d numpy --break-system-packages
python cyberdeck-folding-case.py
```

For a Pocket-Deck-class folder, drop `kb` to a 40 % board, `mod` to a 5" panel, and
`Hb` to ~18 mm for a Zero 2 W. Publish your remix — open plans are the Caring mode.
