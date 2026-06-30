# Full audit — Big Five Forberedelse

**Dato:** 2026-06-30
**Omfang:** Komplett gjennomgang (sikkerhet, kostnad, korrekthet, juridisk, kvalitet,
ytelse, a11y, SEO, UX, drift, testing) av hele appen, inkl. ny Stripe-/kjøpskode.
**Metode:** Read-only gjennomgang av `server.ts`, hele `src/`, `firestore.rules`,
config, `npm audit` og bygg-output. Ingen kodeendringer.
Alvorlighet: **Kritisk / Høy / Medium / Lav / Info (OK)**.

---

## Sammendrag (prioritert)

**Før salg (Høy):**
1. Publiser + koble inn personvern & vilkår (utkast finnes, ikke i appen) — B-funn.
2. Samtykke til umiddelbar levering (angrerett) i kjøpsflyten — B-funn.
3. Org./kontaktinfo (opplysningsplikt) — venter på org.nr.

**Høy verdi / Medium:**
4. Trekk ut duplisert skåringslogikk (6 steder) til én util — korrekthet/vedlikehold.
5. Modal-a11y: Escape + fokusfelle + fokus-retur (kjøpsmodal + confirm).
6. Minimum testdekning for penge-/skåringsstier (ingen tester finnes i dag).
7. Feilovervåking (kun console-logging nå).
8. Rate-limiter per-instans — bevisst beslutning.

**Lav / senere:** bundle-splitt (569 KB), `server.ts`-modularisering, CSP, eget
domene, pris-synk (3 steder), npm audit (transitivt).

---

## 1. Sikkerhet & kostnad

**A1 (Lav) — Kreditt-race ved samtidige kall.** Både analyze-job (`server.ts:374`
pre-check vs `:566` charge) og interview-chat (`:662` vs `:746`) sjekker saldo før og
trekker etter Gemini-kallet. To samtidige kall med saldo=1 kan begge passere → to
leveranser for ett klipp (`chargeOneCredit` → null, men resultat returneres likevel).
*Fiks:* reservér klipp atomisk før Gemini, eller returner 402 når `chargeOneCredit`
gir null. Liten-middels innsats.

**A2 (Medium) — Rate-limiter er in-memory per-instans** (`server.ts:25–55`). Med flere
Cloud Run-instanser blir global grense svakere, og nullstilles ved cold start. Budsjett-
taket er backstop mot kostnad. *Fiks:* delt teller (Firestore/Upstash) eller bevisst
aksept. Middels.

**A3 (Lav) — CSP er fortsatt av** (`helmet({ contentSecurityPolicy: false })`,
`server.ts`). Øvrige headere er på (X-Frame-Options, HSTS, nosniff, referrer-policy).
*Fiks:* skreddersydd CSP for Firebase/Google/Stripe + login-test. Liten-middels.

**Info (OK):** Auth-dekning korrekt på alle endepunkter; klipp trekkes kun ved suksess;
intervju-token HMAC-SHA256 + `timingSafeEqual` + tur-tak (`:630–649`); Stripe-webhook
signatur + idempotens via `stripeEvents`; admin-secret konstant-tid; SESSION_SECRET
fail-fast i prod; secrets aldri commitet; Firestore deny-by-default; input klampes
(MAX_*); prompt rammer brukertekst som data.

## 2. Korrekthet & logikk

**K1 (Medium) — Skåringslogikk duplisert i 6 filer.** Reversering av negativt kodede
ledd (`6 - ans`) og bånd-grenser (`≤2.6` Lav / `≥3.7` Høy) er kopiert i
`pdfExport.ts:39,43`, `App.tsx:718,724`, `InterviewSimulator.tsx:47,50`,
`Results.tsx:57,64`, `ConsistencyReview.tsx:82,89,102` og `JobAnalysis` sin
`getDimensionScores`. Konsistent nå, men endrer man én, divergerer båndene stille.
*Fiks:* eksporter `computeDimensionScores()` + `getBand()` fra `statements.ts` og
gjenbruk overalt. Middels, høy verdi.

**K2 (Lav) — Kommentar/terskel-avvik.** `Results.tsx:308` har en kommentar som regner
med 3.6 mens terskelen er 3.7; rent kosmetisk i en visuell markør. *Fiks:* rett
kommentar/markør.

**Info (OK):** `resolveDimensionKey` (norsk normalisering å→aa/ø→o/æ→ae) er robust;
intervju tur-budsjett dekrementeres korrekt; konsistensavvik (`diff >= 3`) er rimelig.

## 3. Juridisk & personvern  ← blokkerer salg

**J1 (Høy) — Personvern + vilkår ikke i appen.** Utkast finnes (`docs/PERSONVERN.md`,
`docs/VILKAR.md`) men er ikke publisert, lenket i footer, eller vist i kjøpsflyt.
*Fiks:* ferdigstill tekst (krever selskapsdetaljer + jurist) → egen side/rute + lenker.

**J2 (Høy) — Mangler samtykke til umiddelbar levering i kjøp.** For digitalt innhold må
kunden bekrefte umiddelbar levering (da bortfaller angreretten for brukte klipp).
*Fiks:* avkrysning/bekreftelse i checkout før redirect til Stripe.

**J3 (Medium) — Ingen GDPR-sletteflyt** for Firestore-brukerdok (e-post + saldo
består etter lokal sletting). *Fiks:* «slett konto»-endepunkt eller dokumentert rutine.

**J4 (Medium) — Opplysningsplikt:** selskaps-/kontaktinfo mangler på siden (venter org.nr).

## 4. Kodekvalitet & vedlikeholdbarhet

**Q1 (Medium) — Pris/landingstekst duplisert i flere kilder.** Priser finnes i
`server.ts` `CREDIT_PACKAGES` (kilde), hentes dynamisk i `LandingPage` (OK), men er
også **hardkodet** i `index.html` (statisk teaser) — pluss at landingsteksten speiles
i `index.html` vs `LandingPage.tsx`. Endrer du pris i server, blir den statiske stale.
*Fiks:* aksepter med kommentar, eller generer statisk innhold ved bygg. Senere.

**Q2 (Lav) — `server.ts` er monolittisk** (~760 linjer: ruter + hjelpere + prompts).
*Fiks:* splitt i moduler (auth, credits, stripe, gemini). Valgfritt.

**Info (OK):** `noUnusedLocals` på; død kode ryddet; premium-konsept fjernet rent.

## 5. Ytelse & bundle

**P1 (Lav-Medium) — Hovedchunk 569 KB (gzip 148 KB)**, over 500 KB-grensen. Tunge:
firebase-SDK + react + lucide i samme chunk. *Fiks:* `manualChunks` vendor-splitt.

**Info (OK):** `pdfExport` (394 KB) er lazy-lastet (kun ved PDF); html2canvas/canvg/
dompurify fjernet (stub 0.03 KB ✓).

## 6. Tilgjengelighet (a11y)

**T1 (Medium) — Modaler mangler full tastatur-a11y.** Kjøpsmodalen (`App.tsx`) og
confirm-modalen (`Feedback.tsx`) har `role="dialog"`/`aria-modal`, men **ingen
Escape-lukking, ingen fokusfelle, og ingen fokus-retur** til utløser. Kjøpsmodalen
auto-fokuserer heller ikke. *Fiks:* Esc-handler + fokushåndtering (felles hjelper).

**Info (OK):** Faner = roving tabIndex; Likert = radiogroup m/piltaster; toaster
`aria-live="polite"`; confirm har `aria-labelledby` + `autoFocus`.

**T2 (Lav):** Verifiser kontrast for amber-800/amber-50 og teal-tekst mot WCAG AA.

## 7. SEO

**S1 (Medium) — Canonical/OG peker på Cloud Run-URL.** Eget domene gir bedre rangering
+ merkevare. *Fiks:* kjøp domene → oppdater canonical/OG/sitemap. (Senere-steg.)

**Info (OK):** robots.txt, sitemap.xml, OG/Twitter, JSON-LD, og crawlbart statisk
innhold er på plass. (Synk-risiko, se Q1.)

## 8. UX / produkt

**U1 (Lav):** 11 nav-faner overflyter (med scroll-fade) — akseptabelt; vurder gruppering
senere. **Info (OK):** «kommer snart»-tilstand på kjøp er tydelig; ny kjøpsmodal +
prisseksjon er gode tillegg; språk konsistent bokmål.

## 9. Drift & pålitelighet

**D1 (Medium) — Ingen strukturert feilovervåking** (kun `console.*` → Cloud Run-logger).
*Fiks:* Sentry eller Google Cloud Error Reporting før større volum.

**D2 (Lav) — Ingen /healthz-endepunkt.** Cloud Run bruker TCP-sjekk, så ikke kritisk.

**Info (OK):** Graceful degradation når Firebase/Stripe/Gemini mangler (503/«kommer
snart»); Gemini-feil → 500 uten klipp-trekk.

## 10. Testing & avhengigheter

**X1 (Medium) — Null automatiske tester.** Mest verdifulle å dekke: skåring/`getBand`,
`resolveDimensionKey`, kreditt-transaksjoner, webhook-idempotens, `signSession`/
`verifySession`. *Fiks:* Vitest + en håndfull enhetstester for penge-/skåringsstier.

**X2 (Lav) — npm audit: 6 moderate**, transitivt under `firebase-admin`
(`@google-cloud/storage`); ikke utnyttbart i vår bruk; `fix --force` er breaking.
*Fiks:* følg firebase-admin-oppdateringer; aksepter foreløpig.

---

## Anbefalt rekkefølge
1. **Før salg:** J1, J2, J4 (juridisk + checkout-samtykke + org.info).
2. **Høy verdi:** K1 (skårings-util), T1 (modal-a11y), X1 (kjernetester), D1 (overvåking).
3. **Bevisst beslutning:** A1 (klipp-race), A2 (rate-limiter).
4. **Senere/polish:** P1 (bundle), Q1/Q2 (synk + modularisering), A3 (CSP), S1 (domene).

## Valgfritt dypere pass
`/code-review ultra` kan kjøres av deg for en multi-agent sky-gjennomgang som supplement.
