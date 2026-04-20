# Design System Strategy: The Digital Agronomist

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"Refined Earth."** We are moving away from the "rugged/dirty" stereotypes of agriculture toward a high-end, editorial experience that feels as precise as GPS-guided farming and as organic as the soil itself.

This system breaks the "standard app" mold by rejecting rigid, boxed-in grids. Instead, we use **Intentional Asymmetry** and **Tonal Depth**. Imagine an architectural layout where spaces flow into one another—where a seed inventory list isn't just a table, but a series of layered "sheets" resting on a clean, ivory base. We use high-contrast typography scales (Manrope for displays, Work Sans for utility) to create a rhythmic hierarchy that feels both authoritative and modern.

## 2. Colors & Surface Philosophy
The palette is rooted in the landscape: deep forest greens, sun-baked timber, and breathable neutrals.

### The "No-Line" Rule
To achieve a premium, editorial feel, **1px solid borders are strictly prohibited for sectioning.** Boundaries must be defined solely through background color shifts. For example, a dashboard widget should be a `surface-container-lowest` (#ffffff) card sitting on a `surface` (#faf9f7) background. The transition of tone creates the edge, not a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface-container tiers to define importance:
- **Base Layer:** `surface` (#faf9f7) – The vast "field" of the application.
- **Section Layer:** `surface-container-low` (#f4f3f1) – Used for grouping large content areas.
- **Action Layer:** `surface-container-lowest` (#ffffff) – Reserved for the most interactive elements (cards, inputs).
- **Detail Layer:** `surface-container-high` (#e9e8e6) – Used for inset elements like search bars or code blocks.

### The Glass & Signature Texture
- **Glassmorphism:** For floating navigation or "Quick Action" overlays, use `surface` at 80% opacity with a `20px` backdrop-blur. This keeps the user connected to the data "underneath" the interface.
- **Signature Gradients:** For primary CTAs (e.g., "Start Harvest"), do not use a flat green. Apply a subtle linear gradient from `primary` (#154212) to `primary_container` (#2d5a27) at a 135-degree angle. This adds "soul" and depth.

## 3. Typography: The Editorial Voice
We pair the geometric precision of **Manrope** with the hardworking legibility of **Work Sans**.

- **Display & Headlines (Manrope):** Large, bold, and airy. Use `display-lg` (3.5rem) for high-level data summaries (e.g., "Total Yield"). The tight tracking and heavy weight convey the "Robust" nature of the brand.
- **Body & Titles (Work Sans):** High x-height for maximum legibility in the field. Use `body-lg` (1rem) for most content to ensure readability under direct sunlight.
- **Hierarchy as Identity:** By using a massive scale jump between `headline-lg` and `body-md`, we create a "magazine" feel that feels curated rather than a generic database.

## 4. Elevation & Depth
Depth in this system is achieved through **Tonal Layering** and **Ambient Light**, never harsh shadows.

- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift (0.5mm effect) without any CSS shadows.
- **Ambient Shadows:** When an element must "float" (e.g., a modal), use a shadow with a `24px` blur and `4%` opacity. The shadow color should be a tinted version of `on_surface` (#1a1c1b), creating a natural glow rather than a gray smudge.
- **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., in high-contrast mode), use `outline_variant` at **15% opacity**. It should be felt, not seen.

## 5. Components
Our components are tactile and spacious, utilizing the **Spacing Scale** to prevent "data-clutter."

- **Cards**: Forbid divider lines. Separate content using `spacing-4` (1rem) or `spacing-6` (1.5rem). Use `xl` (0.75rem) roundedness for a soft, approachable feel.
- **Buttons**:
    - **Primary**: Gradient-filled (`primary` to `primary_container`), `full` roundedness.
    - **Secondary**: `secondary_container` (#ffbf87) background with `on_secondary_container` text. No border.
- **Agricultural Chips**: Use `secondary_fixed` (#ffdcc1) for seed types and `primary_fixed` (#bcf0ae) for fertilizers. They should look like organic labels.
- **Input Fields**: Use the "Inset" style. Background: `surface_container_highest` (#e3e2e0), no border, `md` roundedness. The label should be `label-md` in `on_surface_variant`.
- **Field Status Indicators**: Instead of standard dots, use soft, glowing blurs of `primary` or `error` to indicate crop health or fuel alerts.

## 6. Do’s and Don’ts

### Do:
- **Use "White Space" as a Separator:** Trust that the `spacing-8` (2rem) gap will guide the eye better than a line.
- **Embrace Asymmetry:** On desktop, allow the main data visualization to take up 65% of the width, with a "floating" wood-toned (`secondary`) sidebar for metadata.
- **Color with Intent:** Use `secondary` (#835425) specifically for "organic" or "human" elements (harvesting, staff), and `primary` (#154212) for "growth" elements (seeds, inputs).

### Don’t:
- **Don't use 100% Black:** It kills the "Earthy" vibe. Use `on_surface` (#1a1c1b) for all "black" text.
- **Don't use Default Shadows:** Never use the standard `box-shadow: 0 2px 4px rgba(0,0,0,0.5)`. It feels cheap and digital.
- **Don't use Rigid Grids for Mobile:** Allow images of crops or equipment to bleed edge-to-edge to create a high-end, immersive feel.