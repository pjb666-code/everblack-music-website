# Design Brief

## Direction

Everblack Music — Professional dark minimalism for guitar teaching and studio services. Turquoise accent (#0D9488) paired with premium shadow hierarchy creates distinctive, craft-focused audio software aesthetic.

## Tone

Sophisticated dark interface with turquoise highlights. Refined, clean, and modern — conveys expertise and creative professionalism without decoration.

## Differentiation

Single turquoise accent (#0D9488) paired with 3-tier shadow system (subtle → medium → elevated) and intentional structural zones creates instantly recognizable premium audio/music aesthetic. No orange, no violet/pink.

## Color Palette

| Token               | OKLCH           | Role                                    |
|---------------------|-----------------|------------------------------------------|
| background          | 0.08 0 0        | Deep charcoal, primary page background  |
| foreground          | 0.95 0 0        | White text, maximum contrast            |
| card                | 0.14 0 0        | Slightly elevated card surfaces         |
| primary             | 0.54 0.20 185   | Turquoise (#0D9488), accent & CTAs      |
| accent              | 0.54 0.20 185   | Turquoise highlight, buttons, focus     |
| secondary           | 0.22 0 0        | Dark gray, section separation           |
| muted               | 0.20 0 0        | Muted text, secondary content           |
| muted-foreground    | 0.72 0 0        | Gray text on dark backgrounds           |
| success             | 0.65 0.15 130   | Emerald for positive states             |
| warning             | 0.7 0.2 60      | Gold for alerts                         |
| destructive         | 0.6 0.25 25     | Red for errors and deletion             |
| border              | 0.28 0 0        | Subtle dividers and input borders       |

## Typography

- Display: General Sans (geometric, modern) — headlines, section titles, hero copy
- Body: DM Sans (humanist, readable) — paragraph text, descriptions, metadata
- Mono: JetBrains Mono (technical) — code blocks, audio metadata, timestamps
- Scale: Hero `text-5xl md:text-6xl`, H2 `text-4xl md:text-5xl`, H3 `text-2xl md:text-3xl`, Body `text-base leading-relaxed`

## Elevation & Depth

Three-tier shadow system: `shadow-subtle` (cards, hover), `shadow-medium` (elevated containers), `shadow-elevated` (modals, overlays). No flat design; every surface has intentional depth.

## Structural Zones

| Zone    | Background        | Border              | Notes                                          |
|---------|-------------------|---------------------|------------------------------------------------|
| Header  | 0.14 0 0 (card)   | 0.22 0 0 (subtle)   | Sticky with backdrop blur on scroll            |
| Content | 0.08 0 0          | —                   | Alternate sections use `0.11 0 0` for rhythm  |
| Cards   | 0.14 0 0          | 0.22 0 0            | `shadow-subtle`, hover to `shadow-medium`     |
| Footer  | 0.12 0 0          | 0.22 0 0 (top)      | Darker than content, aligned left              |

## Spacing & Rhythm

Section gaps 6-8rem (`py-24-32`), content padding 2rem, card gaps 1.5-2rem. Micro-spacing (gap-4 to gap-8) creates visual grouping. Breathing room between lesson cards, studio services, and media galleries.

## Component Patterns

- Buttons: Rounded-md, `bg-accent` with white text, `hover:opacity-90`, `active:opacity-80`. Ghost variants use `bg-transparent` + `hover:bg-muted`.
- Cards: `rounded-lg`, `bg-card` with `shadow-subtle`, `border-border`, interactive cards scale `-2px` on hover with `shadow-medium`.
- Badges: Copper accent for tags, muted for labels. Rounded-full for status indicators.
- Inputs: `bg-input` (0.22 0 0), `text-foreground`, `border-border` with `focus:ring-2 focus:ring-ring`.

## Motion

- Entrance: Staggered fade-in or slide-up (300ms, `cubic-bezier(0.4, 0, 0.2, 1)`) for sections on page load.
- Hover: Button opacity shifts, cards scale up 2px with shadow change (all 300ms smooth transition).
- Decorative: None. Motion is functional only — no spinning, bouncing, or blinking elements.

## Constraints

- No blinking animations or pulsing backgrounds.
- Copper accent used sparingly (CTAs, hover states, highlights only).
- All transitions use smooth easing, never jarring bounces.
- Typography always uses display + body fonts; no fallbacks.

## Signature Detail

Turquoise accent (#0D9488 / L:54 C:20 H:185) — matching guitar brand aesthetic — paired with three-tier shadow hierarchy (subtle → medium → elevated) and intentional structural zones creates distinctive premium audio software aesthetic. Applied sparingly: CTAs, focus states, hover accents, link text. Never orange, never violet/pink.
