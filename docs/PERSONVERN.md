# Personvernerklæring – Big Five Forberedelse

> ⚠️ **UTKAST – må kvalitetssikres av jurist før publisering.** Ikke juridisk
> rådgivning. Fyll inn alle **[plassholdere]** før bruk.

**Sist oppdatert:** [dato]

## 1. Behandlingsansvarlig
[Selskapsnavn], org.nr [xxx xxx xxx], [adresse].
Kontakt for personvern: [e-post].

## 2. Kort oppsummert
Selve øvingstesten, profilberegningen og notatene dine lagres **kun lokalt i din
nettleser** og sendes aldri til oss. Vi behandler personopplysninger om deg bare når
du **logger inn** og når du **frivillig bruker AI-funksjonene** eller **kjøper klipp**.

## 3. Hvilke opplysninger vi behandler

| Opplysning | Når | Hvor |
|------------|-----|------|
| E-postadresse (og Google-bruker-ID) | Ved innlogging med Google | Firebase Authentication |
| Klippsaldo og kontoopprettelsestidspunkt | Ved innlogging/kjøp | Firestore (Google, EU) |
| Stillingstittel, stillingsbeskrivelse og dine beregnede Big Five-skårer | Når du kjører AI-jobbanalyse eller øvingsintervju | Sendes til Google Gemini for å generere svaret |
| Betalingsopplysninger (kortdetaljer m.m.) | Ved kjøp | Håndteres av **Stripe** – vi lagrer ikke kortnummer |
| IP-adresse og tekniske logger | Ved bruk av API-et | Server-logger (Google Cloud Run), for drift og misbruksbeskyttelse |

**Lagres kun lokalt (behandles ikke av oss):** dine testsvar, gjetninger, valgt modus,
profilresultat og personlige notater ligger i nettleserens `localStorage` og forlater
ikke enheten din – med unntak av at stillingsinfo + skårer sendes til Google Gemini
*hvis* du selv velger å kjøre en AI-analyse.

## 4. Formål og rettslig grunnlag (GDPR art. 6)
- **Levere tjenesten du har bedt om** (innlogging, klipp, AI-analyse): oppfyllelse av
  avtale, art. 6(1)(b).
- **Betaling og bokføring**: rettslig forpliktelse, art. 6(1)(c).
- **Drift, sikkerhet og hindring av misbruk** (rate-limiting, logger): berettiget
  interesse, art. 6(1)(f).

## 5. Databehandlere og underleverandører
Vi bruker disse leverandørene som behandler opplysninger på våre vegne:
- **Google (Firebase Authentication, Firestore, Cloud Run, Gemini API)** – innlogging,
  lagring av konto/klipp, drift og AI-generering. Firestore er satt opp i EU (eur3).
- **Stripe** – betalingsbehandling.

AI-leverandøren (Google Gemini) bruker, så vidt vi er kjent med, ikke dine inndata til
å trene modellene sine for API-bruk, men [bekreft mot gjeldende Google-vilkår].

## 6. Overføring utenfor EØS
Enkelte leverandører (Google, Stripe) kan behandle data utenfor EØS. Overføringen er
sikret gjennom [EUs standardavtaler (SCC) / adekvansbeslutning – bekreft].

## 7. Lagringstid
- Konto- og klippdata: så lenge du har en konto. Slettes ved kontosletting (se pkt. 8).
- Betalings-/kvitteringsdata: oppbevares så lenge bokføringsloven krever (5 år).
- Server-logger: [antall] dager.

## 8. Dine rettigheter
Du har rett til innsyn, retting, sletting, begrensning, dataportabilitet og å
protestere. Kontakt [e-post] – for å slette kontoen din og tilhørende data, [beskriv
sletteflyt / "send oss en e-post"]. Du kan klage til **Datatilsynet** (datatilsynet.no).

## 9. Sikkerhet
Data overføres kryptert (HTTPS). Klippsaldo håndteres utelukkende server-side og kan
ikke endres fra nettleseren. Tilgang til driftssystemer er begrenset.

## 10. Informasjonskapsler og lokal lagring
Vi bruker **nødvendige** mekanismer for innlogging (Firebase Authentication benytter
cookies/lokal lagring) og `localStorage` for å lagre testen din lokalt. Vi bruker
**ingen** analyse- eller markedsføringskapsler.

## 11. Endringer
Vi kan oppdatere denne erklæringen. Vesentlige endringer varsles på [hvordan].

## 12. Kontakt
[Selskapsnavn], [e-post].
