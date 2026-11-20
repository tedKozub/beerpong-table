# SPPDF Beerpong Table

<p align="left">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 14" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript%205-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" /></a>
  <a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL%2016-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL 16" /></a>
  <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://daisyui.com/"><img src="https://img.shields.io/badge/DaisyUI_4-5AD8E6?style=for-the-badge&logo=daisyui&logoColor=black" alt="DaisyUI 4" /></a>
  <a href="https://playwright.dev/"><img src="https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white" alt="Playwright" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
</p>

<p align="left">
  <a href="https://staging.beerpong.tadeaskozub.com"><img src="https://img.shields.io/badge/Staging-Live%20Online-2ea44f?style=flat-square&logo=traefik" alt="Staging Live" /></a>
  <a href="https://playwright.dev/"><img src="https://img.shields.io/badge/Tests-42%2F42%20Passed-brightgreen?style=flat-square&logo=playwright" alt="Tests 42/42 Passed" /></a>
  <a href="https://developer.chrome.com/docs/lighthouse/"><img src="https://img.shields.io/badge/Lighthouse%20A11y-100%2F100-success?style=flat-square&logo=googlechrome" alt="Lighthouse A11y 100/100" /></a>
  <a href="https://www.w3.org/WAI/standards-guidelines/wcag/"><img src="https://img.shields.io/badge/WCAG-AAA%20Compliant-blue?style=flat-square" alt="WCAG AAA" /></a>
  <a href="https://github.com/tedKozub/beerpong-table/stargazers"><img src="https://img.shields.io/github/stars/tedKozub/beerpong-table?style=flat-square&logo=github&color=gold" alt="GitHub Stars" /></a>
  <a href="https://github.com/tedKozub/beerpong-table/network/members"><img src="https://img.shields.io/github/forks/tedKozub/beerpong-table?style=flat-square&logo=github&color=blue" alt="GitHub Forks" /></a>
  <a href="https://github.com/tedKozub/beerpong-table/commits/main"><img src="https://img.shields.io/github/last-commit/tedKozub/beerpong-table?style=flat-square&logo=github" alt="Last Commit" /></a>
</p>

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

## Tech Stack & Architecture

| Category | Technologies | Badges |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router, Server Actions, React 18) | ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ![React](https://img.shields.io/badge/React%2018-20232A?style=flat-square&logo=react&logoColor=61DAFB) |
| **Language** | TypeScript 5 (Strict Mode) | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) |
| **Database & ORM** | PostgreSQL 16, Drizzle ORM, Drizzle Kit | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![Drizzle](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black) |
| **Styling & UI Tokens** | Tailwind CSS 3, DaisyUI 4, Lucide Icons | ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![DaisyUI](https://img.shields.io/badge/DaisyUI-5AD8E6?style=flat-square&logo=daisyui&logoColor=black) |
| **State & Forms** | TanStack React Query, React Hook Form | ![React Query](https://img.shields.io/badge/React_Query-FF4154?style=flat-square&logo=reactquery&logoColor=white) ![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=flat-square&logo=reacthookform&logoColor=white) |
| **Testing & Quality** | Playwright (Desktop & Mobile), ESLint | ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white) ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white) |
| **Document Generation** | ExcelJS, jsPDF, jsPDF-AutoTable | ![ExcelJS](https://img.shields.io/badge/ExcelJS-217346?style=flat-square&logo=microsoftexcel&logoColor=white) ![jsPDF](https://img.shields.io/badge/jsPDF-DC382D?style=flat-square&logo=adobeacrobatreader&logoColor=white) |
| **Infra & Containers** | Docker, Node.js 22 Alpine, Coolify, Traefik | ![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white) ![NodeJS](https://img.shields.io/badge/Node.js_22-339933?style=flat-square&logo=nodedotjs&logoColor=white) |

---

## Project Verification Stats

- **End-to-End Test Coverage:** 42 Playwright automated tests verifying authentication, match scoring, mobile responsiveness, PDF/CSV exports, and public boundaries.
- **Lighthouse Accessibility Score:** 100 / 100 with 0 color contrast failures in both `beerpong-light` and `beerpong-dark` modes.
- **Lighthouse Best Practices Score:** 100 / 100.
- **Round-Robin Scheduling:** Generates balanced matches up to 12 parallel tables with zero team collision in the same wave.

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
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_secure_admin_password
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
