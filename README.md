# Big Five Forberedelse

Et refleksjons- og forberedelsesverktøy for jobbkandidater som skal ta en personlighetskartlegging (Femfaktormodellen / Big Five). Brukeren tar en egenvurdering, får en detaljert profil og en debrief, og kan kjøre en valgfri AI-jobbanalyse som matcher profilen mot en konkret stilling.

## Personvern

- **Test og notater er 100 % lokale:** Svar, profilberegning og notater lagres kun i nettleserens `localStorage` og sendes aldri til noen server.
- **AI-jobbanalysen (valgfri) bruker en ekstern tjeneste:** Hvis brukeren kjører AI Jobbanalyse, sendes stillingstittel, stillingsbeskrivelse og de beregnede Big Five-skårene til serveren og videre til **Google Gemini** for å generere rapporten. Resten av appen fungerer fullt ut uten denne funksjonen.

## Teknologi

React 19 + Vite + TypeScript + Tailwind CSS i frontend, og en Express-server (`server.ts`) som proxyer AI-kallet til Google Gemini (`@google/genai`).

## Kjør lokalt

**Forutsetning:** Node.js

1. Installer avhengigheter:
   ```bash
   npm install
   ```
2. Opprett en `.env`-fil (basert på [.env.example](.env.example)) og sett din egen nøkkel:
   ```bash
   GEMINI_API_KEY="din-gemini-api-nøkkel"
   ```
3. Start utviklingsserveren:
   ```bash
   npm run dev
   ```

## Bygg og kjør i produksjon

```bash
npm run build   # bygger frontend (Vite) og bundler serveren til dist/server.cjs
npm start       # kjører dist/server.cjs (krever GEMINI_API_KEY i miljøet)
```

## Deploy

Appen er en Express-server som serverer den bygde frontend-en og proxyer AI-kallene. Den trenger `GEMINI_API_KEY` satt som miljøvariabel i produksjonsmiljøet (aldri sjekk den inn).

**Generelt (hvilken som helst Node-host):**

```bash
npm install
npm run build        # bygger frontend + dist/server.cjs
GEMINI_API_KEY=... npm start
```

Serveren lytter på port `3000` (`0.0.0.0`). Sett `NODE_ENV=production` så den serverer fra `dist/` i stedet for Vite-dev.

**Google Cloud Run (matcher AI Studio-oppsettet):**

```bash
gcloud run deploy big-five-forberedelse \
  --source . \
  --set-env-vars GEMINI_API_KEY=DIN_NØKKEL \
  --allow-unauthenticated
```

**Andre plattformer (Render, Railway, Fly.io, e.l.):**
- Build-kommando: `npm run build`
- Start-kommando: `npm start`
- Miljøvariabel: `GEMINI_API_KEY`
- Sørg for at plattformen ikke overstyrer porten, eller juster `PORT` i `server.ts` til å lese `process.env.PORT` om hosten krever en tildelt port.

> Merk: AI-endepunktene er rate-limitet per IP, men nøkkelen din er fortsatt eksponert for kostnad ved bruk. Vurder en premium-/betalingsgate (se `src/premium/`) før appen publiseres bredt.

## Sikkerhetsnotater

- AI-endepunktet `/api/analyze-job` er rate-limitet per IP (10 forespørsler/minutt) og kapper input-størrelse for å begrense misbruk og Gemini-kostnad.
- `GEMINI_API_KEY` brukes kun server-side og eksponeres aldri til klienten.
