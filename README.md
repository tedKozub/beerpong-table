# SPPDF Beerpong Table

Web application for managing beerpong tournaments and semester league seasons for the **SPPDF MUNI** student union. The system automates semester management, tournament rounds, dynamic team rosters, table scheduling (Round-Robin), live stopwatch, match scoring, statistics exports (XLSX, CSV, PDF), and 16:9 projector presentations.

---

## Repositories & Authors

- **Original Repository:** [petrsgamers/beerpong-table](https://github.com/petrsgamers/beerpong-table) (Authors: Petr Hýbl, Štěpán Řihák, Tadeáš Kozub)
- **Maintained Fork:** [tedKozub/beerpong-table](https://github.com/tedKozub/beerpong-table) (Tadeáš Kozub)
- **IT Division of SPPDF MUNI**

---

## Key Features

- **Round-Robin Match Scheduler:** Deterministic table scheduling algorithm using the Berger circle method (`circleRounds`). Eliminates consecutive match conflicts and optimizes table allocation.
- **Live Tournament Stopwatch:** Integrated countdown timer for tournament directors with presets (6 min, 10 min), digital alarm sound, and minimizable floating toolbar.
- **Exports & Presentation Modes:**
  - Export overall league tables and round statistics to **Excel (.xlsx)** and **CSV**.
  - Generate printable **A4 PDF** table schedules.
  - Generate **16:9 slideshow PDF** for tournament projector / TV screens.
- **Dynamic Weekly Rosters:** Players can represent different teams in different tournament rounds; cumulative individual stats track seamlessly across the entire semester.
- **Statistics & Leaderboards:**
  - Team standings (matches, wins, draws, losses, points).
  - Individual scorers (cups hit).
  - Prestigious **BlowJob King** leaderboard (cups blown out).
  - High-contrast Gold, Silver, and Bronze podium styling compliant with WCAG AAA in both light and dark themes.
- **Public Read-Only Mode:** Safe, isolated view for players and spectators with zero mutation controls or administrative widgets.

---

## Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) & `drizzle-kit`
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), [DaisyUI 4](https://daisyui.com/), [Lucide React](https://lucide.dev/)
- **Form Handling:** [React Hook Form](https://react-hook-form.com/)
- **Testing:** [Playwright](https://playwright.dev/) E2E test suite (Desktop Chrome & Mobile Pixel)
- **Deployment:** Docker, Docker Compose, Coolify, Traefik reverse proxy

---

## Quickstart (Local Development)

### 1. Clone Repository
```bash
git clone https://github.com/tedKozub/beerpong-table.git
cd beerpong-table
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file with the following variables:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beerpong_dev
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
SESSION_SECRET=beerpong_super_secret_session_key_local_development_123456
```

### 4. Database Migrations & Seeding
```bash
npm run migrate
npx tsx src/db/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
```
The application will be running at `http://localhost:3000`.

---

## Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_USERNAME` | Administrator username | `admin` |
| `ADMIN_PASSWORD` | Administrator password | `secretpassword` |
| `SESSION_SECRET` | Secret key for encrypted session cookies (min. 32 chars) | `random_secret_string` |
| `PORT` | HTTP server port (default 3000) | `3000` |
| `NODE_ENV` | Runtime environment | `production` / `development` |

---

## Verification & Quality Assurance

Run the automated validation suite before committing or deploying:

```bash
# Code style and ESLint check
npm run lint

# TypeScript static type check
npx tsc --noEmit

# End-to-End Playwright test suite
npm run test:e2e

# Full deployment verification pipeline
npm run deploy:check
```

---

## Design Guide

Design rules, aesthetic standards, and token specifications are documented in [DESIGN_GUIDE.md](./DESIGN_GUIDE.md). An interactive component catalog is available at the `/design-system` route.
