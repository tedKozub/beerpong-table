# Design Guide: SPPDF Beerpong 2.0

Tento dokument slouží jako závazný průvodce architekturou uživatelského rozhraní, designovými tokeny a komponentami pro vývojáře i autonomní AI agenty pracující v repozitáři **beerpong-table**.

---

## 1. Vizuální a estetické standardy

### A. Pravidla pro Emoji
- **Přísný zákaz emoji v UI i v kódu:**
  - Žádné emoji v nadpisech, tlačítkách, bannerech, toastech, popiscích ani tabulkách.
  - Žádné emoji v commit messages, logovacích hláškách, proměnných ani testech.
  - **Jediná povolená výjimka:** Znak lišky `🦊` výhradně jako součást brandového loga spolku (*🦊 SPPDF Beerpong*).
- Místo emoji používejte profesionální typografii a standardní SVG ikony z knihovny `lucide-react`.

### B. Omezení ikon a odznaků (Badges / Pills)
- **Ikony:** Používejte pouze tam, kde vyjasňují akci (např. tužka pro úpravu, křížek pro zrušení, lupa pro vyhledávání). Nevkládejte ikony před každý běžný textový štítek.
- **Odznaky (Pills / Badges):** Vyvarujte se nadměrného obalování běžných dat do barevných pilulek. Badges jsou vyhrazeny výhradně pro:
  - Kritické stavy (např. *Dokončeno*, *Plánováno*, *Právě se hraje*).
  - Významné kvantitativní počty (např. počet zápasů ve vlně, počet hráčů v týmu).
- **Terminologie:** Ocenění **BlowJob King** zůstává vždy v původním anglickém znění bez překladu.

---

## 2. Barevná témata a Designové tokeny

Aplikace využívá DaisyUI 4 integrované s Tailwind CSS. Všechny komponenty musí fungovat a být 100% čitelné ve světlém i tmavém motivu s garancí **WCAG AAA** kontrastu (minimální kontrastní poměr 7:1 pro běžný text).

### A. Témata
- **Světlý motiv (`beerpong-light`):**
  - `primary`: `#9a3412` (sytá pivní měď pro vysoký kontrast 7.2:1 na světlém podkladu)
  - `success`: `#166534` (tmavá lesní zeleň pro kontrast 7.5:1)
  - `base-100`: `#ffffff` (čisté bílé karty)
  - `base-200`: `#f8fafc` (jemné pozadí těla stránky)
  - `base-300`: `#e2e8f0` (rámečky a oddělovače)
  - `base-content`: `#0f172a` (hluboká břidlice pro text)
- **Tmavý motiv (`beerpong-dark`):**
  - `primary`: `#fb923c` (jasná teplá oranžová)
  - `success`: `#4ade80` (světle zelená)
  - `base-100`: `#141923` (hluboké tmavě šedé karty)
  - `base-200`: `#0d1117` (pozadí stránky)
  - `base-300`: `#262f3d` (kontrastní rámečky)
  - `base-content`: `#f1f5f9` (světlý text)

### B. Specifikace pódia (Stupně vítězů)
Stupně vítězů jsou implementovány v [src/lib/podium.tsx](file:///root/beerpong-table/src/lib/podium.tsx):
- **1. místo (Zlato):**
  - Levý rámeček: `border-l-4 border-l-warning`
  - Podkres řádku: `bg-warning/[0.08]` (ve světlém) / `bg-warning/[0.12]` (v tmavém)
  - Textová barva štítku: `#854d0e` (light) / `#fef08a` (dark)
- **2. místo (Stříbro):**
  - Levý rámeček: `border-l-4 border-l-base-content/40`
  - Podkres řádku: `bg-base-200/50`
  - Textová barva štítku: `#334155` (light) / `#cbd5e1` (dark)
- **3. místo (Bronz):**
  - Levý rámeček: `border-l-4 border-l-amber-600`
  - Podkres řádku: `bg-amber-800/[0.08]` (ve světlém) / `bg-amber-800/[0.15]` (v tmavém)
  - Textová barva štítku: `#78350f` (light) / `#fcd34d` (dark)
- **4.+ místo:**
  - Vždy aplikujte `border-l-4 border-l-transparent`, aby všechny řádky měly stejnou šířku a nedocházelo k posunu layoutu (Cumulative Layout Shift = 0).

---

## 3. Pravidla pro komponenty

### A. Sbalitelné sekce (Accordions)
Pro dlouhé seznamy a vedlejší sekce (např. *Odehraná utkání večera*, *Celý rozpis turnajového večera*, *Soupisky týmů pro tento večer*) používejte nativní HTML `<details>` s DaisyUI třídami:
```tsx
<details className="collapse collapse-arrow bg-base-100 shadow-md border border-base-200" open>
  <summary className="collapse-title p-4 sm:p-6 cursor-pointer select-none font-bold text-lg flex items-center justify-between pr-12">
    <span>Název sekce</span>
  </summary>
  <div className="collapse-content px-4 sm:px-6 pb-4 sm:pb-6 pt-0">
    {/* Obsah */}
  </div>
</details>
```

### B. Tabulky pořadí (`StandingsTable`)
- Pevné minimální šířky pro číselné sloupce (např. `w-14 sm:w-16`).
- Třída `tabular-nums` pro všechna čísla a skóre, aby se sloupce neposouvaly při změně hodnot.
- Podpora vodorovného posunu tabulky na mobilech (`overflow-x-auto w-full`).

### C. Karty žebříčků (`LeaderboardCard`)
- Zobrazují náhled Top 5 hráčů.
- Obsahují tlačítko pro otevření plného dialogu se statistikami všech hráčů a interaktivním vyhledáváním.
- Pevná minimální výška `min-h-[380px]`, aby nedocházelo ke skákání layoutu při přepínání zobrazení.

### D. Veřejný vs. Administrátorský režim
- Veřejné stránky pod `/public` nesmí **nikdy** obsahovat:
  - Tlačítka pro zápis nebo úpravu skóre (*Vyplnit*, *Upravit*).
  - Tlačítka pro mazání nebo přejmenování čehokoliv.
  - Nápovědné texty pro zápis (*„Kliknutím na zápas otevřeš zadání bodů“*).
  - Turnajové stopky.
  - Přepínač semestrů s mutacemi.
- Pro veřejné zobrazení vždy používejte `<PublicNavbar />` a parametr `isAdmin={false}`.

---

## 4. Formuláře, Validace a Chybové stavy

### A. Klientská validace přes React Hook Form
- Všechny formuláře s uživatelským vstupem musí využívat `react-hook-form`.
- Povinná pole musí mít explicitní chybovou hlášku v češtině.
- Během odesílání formuláře musí být tlačítko v disabled stavu a zobrazovat rotující spinner `Loader2`.

### B. Serverové akce (Server Actions)
- Serverové akce nesmí vyhazovat neošetřené výjimky (`throw new Error(...)`), které by v Next.js vedly ke generické chybové stránce *„An error occurred in the Server Components render“*.
- Vždy vracejte strukturovaný objekt:
  ```ts
  type ActionResponse<T = any> = 
    | { success: true; data?: T }
    | { success: false; error: string };
  ```
- Ošetřujte unikátnost jmen (např. hráčů, týmů, semestrů) case-insensitive kontrolou (`lower(name) = lower(...)`).

### C. Uživatelská zpětná vazba (Toasty)
- Úspěch: `toast({ title: "...", description: "..." })`
- Chyba: `toast({ title: "Chyba", description: errorMsg, variant: "destructive" })`

---

## 5. Mobilní responzivita

- **Nulový horizontální scroll:** Celá stránka musí držet šířku `100vw`. Používejte `min-w-0`, `max-w-full`, `truncate` a `break-words` na textech týmů a hráčů.
- **Klikací plochy:** Tlačítka a interaktivní prvky na dotykových displejích musí mít výšku minimálně 44px (nebo odpovídající padding `py-2 sm:py-1.5`).
- **Responzivní hlavičky:** Tlačítka v hlavičce stohujte přes `flex flex-wrap items-center gap-2 w-full sm:w-auto`.
