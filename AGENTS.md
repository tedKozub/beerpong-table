# Engineering & Design Guidelines for AI Agents (SPPDF Beerpong)

This file extends the root `/root/AGENTS.md` guidelines specifically for the **beerpong-table** repository.

---

## 1. Visual & Aesthetic Standards

- **Strict No-Emoji Policy:**
  - Never use emojis in UI titles, buttons, badges, tables, alerts, or toasts.
  - Never use emojis in code, log statements, test descriptions, or commit messages.
  - **Single Allowed Exception:** The fox icon `🦊` exclusively for the brand logo (*🦊 SPPDF Beerpong*).
- **Iconography & Badges:**
  - Icons from `lucide-react` are permitted only when clarifying an action.
  - Do not decorate every label with badges/pills. Badges are reserved for critical states (*Dokončeno*, *Plánováno*, *Právě se hraje*) or quantitative counts >= 2.
- **Terminology:**
  - The award **BlowJob King** stays in original English without Czech translation.

---

## 2. Design System & Theme Tokens

- Follow the complete specifications in [DESIGN_GUIDE.md](./DESIGN_GUIDE.md).
- Both `beerpong-light` and `beerpong-dark` must guarantee WCAG AAA contrast (minimum 7:1 ratio).
- **Podium styling (1st, 2nd, 3rd):** Use `src/lib/podium.tsx` (`renderRank` and `getPodiumRowStyle`) with colored accent borders, subtle tints, and `border-l-4 border-l-transparent` on 4th+ place rows to prevent layout shift.
- Test against `/design-system` for visual reference.

---

## 3. Server Actions & Form Handling

- **React Hook Form:** Use `react-hook-form` for all user-input forms with inline validation messages.
- **Structured Returns:** Server actions must return `{ success: true, data } | { success: false, error: string }`. Never throw raw unhandled errors in Next.js Server Actions.
- **Feedback:** Use `useToast` to provide clear feedback on mutations.
- **Case-Insensitive Uniqueness:** When checking team, player, or season names, always use `lower(name) = lower(${trimmed})`.

---

## 4. Public vs. Admin Security Boundary

- Public pages (`/public`, `/public/rounds/[id]`) must **never** contain mutation buttons, score-filling dialogs, administrative stopwatch, or administrative switcher widgets.
- Always use `<PublicNavbar />` and `isAdmin={false}` on public views.

---

## 5. Verification Before Finalizing

Always run and verify:
```bash
npm run lint
npx tsc --noEmit
npm run test:e2e
```
Never push changes without passing all static analysis and Playwright end-to-end tests.
