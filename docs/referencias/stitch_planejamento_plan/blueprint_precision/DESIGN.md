# Design System Strategy: The Methodical Architect

This design system is a high-end framework engineered for the PDCA (Plan-Do-Check-Act) methodology. It moves beyond the "SaaS dashboard" cliché by treating process management as an editorial experience. We replace rigid lines and generic grids with tonal layering, intentional asymmetry, and a sophisticated typographic hierarchy that directs the eye through complex data with surgical precision.

## 1. Creative North Star: The Methodical Architect
The system is built on the philosophy of **"Structured Clarity."** Like a high-end architectural blueprint, it is precise, authoritative, and clean, but never cold. We achieve this by using "breathing room" (generous white space) and a "No-Line" philosophy that relies on background shifts rather than borders to define functional zones.

## 2. Color & Tonal Architecture
The palette is rooted in a deep, trustworthy `primary` (#003d9b) and uses functional colors to signify the PDCA lifecycle stages.

### The Lifecycle Palette
*   **Plan (Primary):** Use `primary` and `primary_container` for the foundation and goal-setting phases.
*   **Do (Secondary):** Use `secondary` (#006d3f) for execution and active progress.
*   **Check/Act (Tertiary):** Use `tertiary` (#6c3500) for alerts, reviews, and adjustments.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content.
Visual separation must be achieved through background color shifts. A `surface_container_low` section sitting on a `surface` background creates a sophisticated boundary that feels integrated, not "boxed in."

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked, premium materials. Use the `surface_container` tiers to create logical nesting:
*   **Base Layer:** `surface` (#f8f9fb)
*   **Secondary Content Zones:** `surface_container_low` (#f3f4f6)
*   **Active Cards/Modules:** `surface_container_lowest` (#ffffff) for maximum "pop" and legibility.

### The Glass & Gradient Rule
For main action CTAs or hero process headers, apply a subtle linear gradient transitioning from `primary` (#003d9b) to `primary_container` (#0052cc). For floating navigation or modal overlays, use **Glassmorphism**: apply `surface_container_lowest` at 80% opacity with a `20px` backdrop blur to allow the lifecycle colors to bleed through softly.

## 3. Typography: The Editorial Edge
We use a dual-typeface system to balance industrial precision with modern accessibility.

*   **Display & Headlines (Manrope):** Chosen for its geometric but warm structure. Use `display-lg` (3.5rem) and `headline-md` (1.75rem) with tighter letter-spacing (-0.02em) to create an authoritative, editorial feel for process titles.
*   **Body & Labels (Inter):** The workhorse. Use `body-md` (0.875rem) for data density. Inter's high x-height ensures readability in complex PDCA tables.
*   **Intentional Scale:** Use high contrast between `headline-sm` and `label-sm` to immediately signal the difference between "The Goal" and "The Detail."

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are forbidden unless an element is truly "floating" (e.g., a modal or FAB).

*   **The Layering Principle:** Place a `surface_container_lowest` card atop a `surface_container_high` background. This creates a natural "lift" through color value alone.
*   **Ambient Shadows:** If a shadow is required, use a `12%` opacity version of `on_surface` with a `32px` blur and `8px` Y-offset. This mimics natural light rather than digital "glow."
*   **The Ghost Border:** If accessibility requires a stroke, use `outline_variant` (#c3c6d6) at 15% opacity. It should be felt, not seen.

## 5. Primitive Components

### Buttons & Interaction
*   **Primary Action:** `primary` background with `on_primary` text. Use `rounded-md` (0.375rem). Apply a subtle inner-shadow (white at 10% opacity) on the top edge to give it a "pressed" tactile feel.
*   **Ghost Actions:** Use `primary` text on a transparent background. No border. On hover, shift the background to `surface_container_high`.

### PDCA Progress Chips
*   **Plan:** `primary_fixed` background / `on_primary_fixed` text.
*   **Do:** `secondary_fixed` background / `on_secondary_fixed` text.
*   **Act:** `tertiary_fixed` background / `on_tertiary_fixed` text.
*   *Style:* Use `rounded-full` and `label-md` typography.

### Data Cards & Lists
*   **Constraint:** Forbid divider lines.
*   **Solution:** Use `spacing-5` (1.1rem) of vertical white space to separate items. If data is dense, use alternating backgrounds (Zebra striping) using `surface` and `surface_container_low`.

### Process Input Fields
*   **Resting:** `surface_container_highest` background with a `ghost border`.
*   **Active/Focus:** Shift background to `surface_container_lowest` and add a `2px` `primary` bottom-only stroke. This maintains the "clean" aesthetic while providing clear focus.

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align high-level metrics to the left and process details to a slightly offset right column to break the "grid-lock."
*   **Use Tonal Shifts:** Always use `surface_container_low` for sidebar navigation to distinguish it from the main `surface` workspace.
*   **Prioritize Typography:** Let the size and weight of the font do the work that borders usually do.

### Don't:
*   **Don't use pure black:** Use `on_surface` (#191c1e) for all text to maintain a premium, softened contrast.
*   **Don't use 1px borders:** They clutter the UI and make the PDCA process feel like a spreadsheet rather than a workflow.
*   **Don't crowd the data:** If a view feels "heavy," increase the spacing token by one level (e.g., move from `spacing-4` to `spacing-5`) rather than shrinking the font.