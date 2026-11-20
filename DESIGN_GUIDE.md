# Design Guide: SPPDF Beerpong 2.0

This document defines the binding UI architecture, design tokens, and component guidelines for developers and autonomous AI agents working in the **beerpong-table** repository.

---

## 1. Visual & Aesthetic Standards

### A. Emoji Policy
- **Strict Ban on Emojis in UI and Code:**
  - Never use emojis in headings, titles, buttons, alert banners, toasts, placeholders, metadata tags, or footer links.
  - Never use emojis in source code, variable names, log statements, test descriptions, commit messages, or documentation.
  - **Single Allowed Exception:** The fox icon `🦊` exclusively for the brand title (*🦊 SPPDF Beerpong*).
- Rely on clean typography, precise microcopy, and standard SVG icons from `lucide-react`.

### B. Minimal Iconography & Badges
- **Icons:** Use icons strictly to clarify ambiguous actions (e.g., pencil for edit, trash for delete, search for query). Never prepend decorative icons to self-explanatory text labels.
- **Badge Proliferation:** Avoid surrounding everyday data fields with pill badges or colored tags. Badges are reserved exclusively for:
  - Critical status indicators (*Dokončeno*, *Plánováno*, *Právě se hraje*).
  - Quantitative counts >= 2 (e.g., match count in a wave, player count in a team).
- **Terminology:** The award title **BlowJob King** is permanently kept in original English without Czech translation.

---

## 2. Color Themes & Design Tokens

The application leverages DaisyUI 4 integrated with Tailwind CSS. All components must function seamlessly and remain 100% readable in both light and dark modes, guaranteeing **WCAG AAA** contrast compliance (minimum 7:1 contrast ratio for normal text).

### A. Themes
- **Light Theme (`beerpong-light`):**
  - `primary`: `#9a3412` (deep amber-copper for 7.2:1 contrast on light backgrounds)
  - `success`: `#166534` (forest green for 7.5:1 contrast)
  - `base-100`: `#ffffff` (clean white cards)
  - `base-200`: `#f8fafc` (subtle page background)
  - `base-300`: `#e2e8f0` (borders and dividers)
  - `base-content`: `#0f172a` (deep slate text)
- **Dark Theme (`beerpong-dark`):**
  - `primary`: `#fb923c` (bright warm orange)
  - `success`: `#4ade80` (bright green)
  - `base-100`: `#141923` (deep dark grey cards)
  - `base-200`: `#0d1117` (canvas background)
  - `base-300`: `#262f3d` (contrast borders)
  - `base-content`: `#f1f5f9` (bright slate text)

### B. Podium Hierarchy (1st, 2nd, 3rd Place)
Podium styles are implemented centrally in [src/lib/podium.tsx](file:///root/beerpong-table/src/lib/podium.tsx):
- **1st Place (Gold):**
  - Left border: `border-l-4 border-l-warning`
  - Row tint: `bg-warning/[0.08]` (light) / `bg-warning/[0.12]` (dark)
  - Badge text color: `#854d0e` (light) / `#fef08a` (dark)
- **2nd Place (Silver):**
  - Left border: `border-l-4 border-l-base-content/40`
  - Row tint: `bg-base-200/50`
  - Badge text color: `#334155` (light) / `#cbd5e1` (dark)
- **3rd Place (Bronze):**
  - Left border: `border-l-4 border-l-amber-600`
  - Row tint: `bg-amber-800/[0.08]` (light) / `bg-amber-800/[0.15]` (dark)
  - Badge text color: `#78350f` (light) / `#fcd34d` (dark)
- **4th+ Place:**
  - Always apply `border-l-4 border-l-transparent` so all rows maintain identical column widths, preventing Cumulative Layout Shift (CLS = 0).

---

## 3. Component Guidelines

### A. Collapsible Sections (Accordions)
Use native HTML `<details>` elements styled with DaisyUI collapse classes for long lists and secondary content (*Odehraná utkání večera*, *Celý rozpis turnajového večera*, *Soupisky týmů pro tento večer*):
```tsx
<details className="collapse collapse-arrow bg-base-100 shadow-md border border-base-200" open>
  <summary className="collapse-title p-4 sm:p-6 cursor-pointer select-none font-bold text-lg flex items-center justify-between pr-12">
    <span>Section Title</span>
  </summary>
  <div className="collapse-content px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
    {/* Content */}
  </div>
</details>
```

### B. Standings Tables (`StandingsTable`)
- Enforce fixed column widths for numeric data (e.g., `w-14 sm:w-16`).
- Always use `tabular-nums` for numbers and scores to prevent layout twitching during value updates.
- Support mobile horizontal scrolling via `overflow-x-auto w-full`.

### C. Leaderboard Cards (`LeaderboardCard`)
- Display a preview of the top 5 players.
- Provide a button opening a full modal dialog with real-time search filtering.
- Maintain a minimum height `min-h-[380px]` to eliminate layout shifts when toggling tabs or views.

### D. Public vs. Admin Boundary
- Public routes under `/public/*` must **never** contain:
  - Mutation controls or score entry buttons (*Vyplnit*, *Upravit*).
  - Deletion or renaming controls.
  - Hint copy for editing (*„Kliknutím na zápas otevřeš zadání bodů“*).
  - Tournament stopwatch.
  - Active semester switcher with mutation effects.
- Always render `<PublicNavbar />` and pass `isAdmin={false}` on public views.

---

## 4. Forms, Validation & Error States

### A. Client-Side Validation with React Hook Form
- All user-input forms must use `react-hook-form`.
- Required fields must display clear inline validation errors.
- Buttons must display a disabled state with a spinning `Loader2` during asynchronous submission.

### B. Server Actions
- Server actions must never throw unhandled runtime errors that cause generic Next.js crashes (*„An error occurred in the Server Components render“*).
- Always return a structured response object:
  ```ts
  type ActionResponse<T = any> = 
    | { success: true; data?: T }
    | { success: false; error: string };
  ```
- Enforce case-insensitive uniqueness checks on names (teams, players, seasons) via `lower(name) = lower(...)`.

### C. User Feedback (Toasts)
- Success: `toast({ title: "...", description: "..." })`
- Error: `toast({ title: "Chyba", description: errorMsg, variant: "destructive" })`

---

## 5. Mobile Responsiveness

- **Zero Horizontal Overflow:** The page must strictly fit within `100vw`. Apply `min-w-0`, `max-w-full`, `truncate`, and `break-words` on long strings.
- **Touch Targets:** Buttons and interactive elements must have a touch target height of at least 44px on mobile devices.
- **Responsive Headers:** Stack action buttons on small viewports using `flex flex-wrap items-center gap-2 w-full sm:w-auto`.
