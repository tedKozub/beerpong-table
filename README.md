# SPPDF Beerpong Table

Webová aplikace pro správu pivních turnajů a celosemestrální ligy spolku **SPPDF MUNI**. Systém automatizuje správu semestrů, turnajových večerů, dynamické soupisky týmů, generování rozpisu stolů (Round-Robin), živé stopky, zadávání výsledků, exporty statistik (XLSX, CSV, PDF) a prezentace na projektor.

---

## Repozitáře & Autoři

- **Původní repozitář:** [petrsgamers/beerpong-table](https://github.com/petrsgamers/beerpong-table) (autoři: Petr Hýbl, Štěpán Řihák, Tadeáš Kozub)
- **Aktuální fork & údržba:** [tedKozub/beerpong-table](https://github.com/tedKozub/beerpong-table) (Tadeáš Kozub)
- **IT divize spolku SPPDF MUNI**

---

## Hlavní Funkce

- **Generování rozpisu zápasů na stoly:** Deterministický Round-Robin algoritmus využívající Bergerovy tabulky (`circleRounds`). Zamezuje souběžnému hraní stejného týmu a optimalizuje využití stolů.
- **Živé turnajové stopky:** Integrovaný časoměřič pro administrátory s předvolbami (6 min, 10 min), digitálním zvukovým signálem po dojetí a možností minimalizace do plovoucí lišty.
- **Exporty & Prezentace:**
  - Export celkových tabulek a statistik kola do **Excel (.xlsx)** i **CSV**.
  - Generování rozpisů stolů do **PDF (A4 formát)** pro tisk.
  - Generování prezentace zápasových vln **PDF v poměru 16:9** na promítací plátno / TV.
- **Dynamické soupisky týmů:** Hráči mohou v jednotlivých kolech semestru nastupovat za různé týmy, přičemž jejich individuální statistiky se sčítají napříč celou sezónou.
- **Statistiky & Žebříčky:**
  - Týmová tabulka (výhry, remízy, prohry, skóre, body).
  - Střelci večera i celého semestru (trefené kelímky).
  - Prestižní ocenění **BlowJob King** (vyfouknuté kelímky).
  - Zlaté, stříbrné a bronzové stupně vítězů s vysokým kontrastem splňujícím WCAG AAA ve světlém i tmavém režimu.
- **Veřejné zobrazení (Public Mode):** Bezpečná, čistě čtecí sekce pro hráče a diváky bez administrátorských ovládacích prvků.

---

## Technologický Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- **Jazyk:** [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Databáze:** [PostgreSQL](https://www.postgresql.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/) & `drizzle-kit`
- **Styling & UI:** [Tailwind CSS](https://tailwindcss.com/), [DaisyUI 4](https://daisyui.com/), [Lucide React](https://lucide.dev/)
- **Formuláře:** [React Hook Form](https://react-hook-form.com/)
- **Testování:** [Playwright](https://playwright.dev/) E2E testy (Desktop & Mobile)
- **Kontejnerizace:** Docker, Docker Compose, Traefik proxy

---

## Rychlý Start (Lokální Vývoj)

### 1. Klonování repozitáře
```bash
git clone https://github.com/tedKozub/beerpong-table.git
cd beerpong-table
```

### 2. Instalace závislostí
```bash
npm install
```

### 3. Konfigurace prostředí
Vytvořte soubor `.env.local` na základě níže uvedených proměnných:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/beerpong_dev
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
SESSION_SECRET=beerpong_super_secret_session_key_local_development_123456
```

### 4. Databázové migrace & Seeding
```bash
npm run migrate
npx tsx src/db/seed.ts
```

### 5. Spuštění vývojového serveru
```bash
npm run dev
```
Aplikace běží na `http://localhost:3000`.

---

## Konfigurační Proměnné Prostředí

| Proměnná | Popis | Příklad |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `ADMIN_USERNAME` | Uživatelské jméno správce turnaje | `admin` |
| `ADMIN_PASSWORD` | Heslo pro přístup do administrace | `bezpecneheslo` |
| `SESSION_SECRET` | Šifrovací klíč pro session cookies (min. 32 znaků) | `nahodny_tajny_klic` |
| `PORT` | Port, na kterém aplikace naslouchá (výchozí 3000) | `3000` |
| `NODE_ENV` | Běhové prostředí | `production` / `development` |

---

## Testování a Ověřování Kvality

Před každým commitem a nasazením do produkce spusťte sadu kontrol:

```bash
# Kontrola formátování a linteru
npm run lint

# Statická typová kontrola
npx tsc --noEmit

# End-to-End Playwright testy
npm run test:e2e

# Souhrnný deploy check
npm run deploy:check
```

---

## Designový Průvodce (Design System)

Pravidla designu, vizuální standardy a designové tokeny jsou podrobně zdokumentovány v souboru [DESIGN_GUIDE.md](./DESIGN_GUIDE.md). Interaktivní vzorník komponent a barevných témat je k dispozici na cestě `/design-system`.
