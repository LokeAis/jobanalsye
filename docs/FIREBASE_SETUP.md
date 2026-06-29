# Firebase-oppsett (Fase 1: innlogging + klippekort)

Følg disse stegene én gang for å aktivere innlogging og AI-klippekort. Tar ~15 min.
Verdier merket 🔒 er **hemmelige** — legg dem KUN i `.env` (som er git-ignorert), aldri i koden.

---

## 1. Opprett Firebase-prosjekt
1. Gå til https://console.firebase.google.com → **Add project**.
2. Gi det et navn (f.eks. `big-five-forberedelse`). Google Analytics er valgfritt (kan skrus av).
3. Vent til prosjektet er opprettet → **Continue**.

## 2. Slå på Google-innlogging
1. Venstremeny → **Build → Authentication** → **Get started**.
2. Fanen **Sign-in method** → velg **Google** → **Enable**.
3. Velg en «support email» → **Save**.
4. (Gjøres senere ved deploy) Fanen **Settings → Authorized domains** → **Add domain** → legg til prod-domenet ditt. `localhost` er allerede tillatt for lokal testing.

## 3. Opprett Firestore
1. Venstremeny → **Build → Firestore Database** → **Create database**.
2. Velg lokasjon (f.eks. `eur3` / europe-west) → **Next**.
3. Start i **Production mode** → **Create**.
4. Fanen **Rules** → lim inn innholdet fra [`firestore.rules`](../firestore.rules) i repoet → **Publish**.
   (Dette gjør at kun serveren kan endre klippsaldo.)

## 4. Hent KLIENT-config (ikke hemmelig)
1. Tannhjul oppe til venstre → **Project settings** → fanen **General**.
2. Scroll til **Your apps** → klikk web-ikonet **`</>`** → registrer app (navn f.eks. `web`). Hosting trengs ikke.
3. Du får et `firebaseConfig`-objekt. Kopier verdiene inn i `.env`:

```
VITE_FIREBASE_API_KEY=<apiKey>
VITE_FIREBASE_AUTH_DOMAIN=<authDomain>
VITE_FIREBASE_PROJECT_ID=<projectId>
VITE_FIREBASE_STORAGE_BUCKET=<storageBucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<messagingSenderId>
VITE_FIREBASE_APP_ID=<appId>
```

## 5. Hent SERVER-credentials 🔒
1. **Project settings → Service accounts**.
2. **Generate new private key** → bekreft → en JSON-fil lastes ned.
3. Gjør JSON-en om til én linje og legg i `.env`:

```
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...", ... }'
```
   Tips (PowerShell, én linje):
   `(Get-Content sti\til\fil.json -Raw) -replace "`r`n","" -replace "`n",""`

## 6. Fyll inn resten av `.env`
```
GEMINI_API_KEY=<din gemini-nøkkel>        # 🔒
STARTER_CREDITS=1                          # gratis klipp til nye brukere
ADMIN_TOPUP_SECRET=<lang tilfeldig streng> # 🔒 for manuell påfylling
SESSION_SECRET=<lang tilfeldig streng>     # 🔒 signerer intervju-økter
```
Generer tilfeldige strenger: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

## 7. Start og test lokalt
```
npm install
npm run dev          # http://localhost:3000
```
Sjekk:
- [ ] «Logg inn»-knapp i toppen → Google-popup fungerer.
- [ ] Etter innlogging vises «1 klipp» (eller din STARTER_CREDITS).
- [ ] Fullfør testen → AI Jobbanalyse → kjør analyse → saldo går ned med 1.
- [ ] Med 0 klipp: knappen viser «ingen klipp igjen» (server svarer 402).

## 8. Manuell påfylling av klipp (til Stripe er på plass)
```bash
curl -X POST http://localhost:3000/api/admin/grant-credits \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: DITT_ADMIN_TOPUP_SECRET" \
  -d '{"email":"din-innloggede-epost@gmail.com","amount":5}'
```
Brukeren må ha logget inn minst én gang først (så kontoen finnes). Last siden på nytt for å se ny saldo.

---

### Feilsøking
- **«Innlogging er ikke konfigurert på serveren» (503):** `FIREBASE_SERVICE_ACCOUNT` mangler/ugyldig JSON.
- **Popup lukkes uten innlogging:** sjekk at domenet er under Authentication → Authorized domains.
- **401 på alle AI-kall:** klienten mangler `VITE_FIREBASE_*` (bygg på nytt etter å ha endret `.env`).
- **Saldo oppdateres ikke:** sjekk at Firestore er opprettet og at reglene er publisert.
