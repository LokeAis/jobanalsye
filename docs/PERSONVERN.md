# Personvernerklæring – Big Five Forberedelse

> Fyll inn alle **[plassholdere]** før publisering.

**Sist oppdatert:** [dato]

## 1. Behandlingsansvarlig
[Selskapsnavn], org.nr [xxx xxx xxx], [adresse].
Kontakt for personvern: [e-post].

## 2. Kort oppsummert
Selve øvingstesten, profilberegningen og notatene dine lagres **lokalt i din
nettleser**. Vi behandler personopplysninger om deg når du **logger inn**, når du
**kjøper klipp**, og når du **frivillig bruker AI-funksjonene**. Når du starter en
AI-analyse eller et øvingsintervju, sendes stillingsinfo og dine Big Five-skårer til
Google Gemini for å generere svaret (se punkt 5 og 6). Utover dette forlater ikke
testsvarene dine enheten din.

## 3. Hvilke opplysninger vi behandler
- **E-postadresse og Google-bruker-ID:** Ved innlogging med Google (Firebase Authentication).
- **Klippsaldo og kontoopprettelsestidspunkt:** For å holde styr på dine kjøp (Firestore, EU-region eur3).
- **Stillingstittel, stillingsbeskrivelse og beregnede Big Five-skårer:** Når du aktivt starter en AI-jobbanalyse eller øvingsintervju, sendes disse til Google Gemini API for å generere svaret.
- **Betalingsopplysninger:** Håndteres direkte av Stripe. Vi lagrer ikke kortnummeret ditt.
- **IP-adresse og tekniske logger:** For drift og misbruksbeskyttelse (server-logger i Google Cloud Run).

*Merk: Testsvar, gjetninger og personlige notater ligger kun i nettleserens
`localStorage` og forlater ikke enheten din – med unntak av at stillingsinfo + skårer
sendes til AI-analysen når du selv starter den.*

## 4. Formål og rettslig grunnlag (GDPR art. 6)
- **Levere tjenesten du har bedt om** (innlogging, klipp, AI-analyse): oppfyllelse av avtale, art. 6(1)(b).
- **Betaling og bokføring:** rettslig forpliktelse, art. 6(1)(c).
- **Drift, sikkerhet og hindring av misbruk:** berettiget interesse, art. 6(1)(f).

## 5. Databehandlere og underleverandører
Vi bruker underleverandører for å levere tjenesten:
- **Google Cloud / Firebase / Firestore / Cloud Run:** innlogging, lagring av kontodata, drift, database og teknisk infrastruktur. Firestore er satt opp i EU-regionen eur3 for konto- og klippdata.
- **Google Gemini API via Google AI Studio / Cloud Billing:** generering av AI-basert debrief, forklaring og øvingsprofil.
- **Stripe:** betaling, betalingsstatus og kvitteringsgrunnlag. Vi lagrer ikke kortnummeret ditt.

Når Gemini API brukes gjennom et Google Cloud-prosjekt med aktiv Cloud Billing,
behandles bruken som en betalt Gemini API-tjeneste (Paid Service). Etter Googles
gjeldende vilkår for betalte tjenester bruker Google **ikke** prompts,
systeminstruksjoner, filer eller genererte svar til å forbedre Google-produkter eller
trene generelle modeller, og behandler prompts/svar etter Googles databehandleravtale
der Google er databehandler. Google kan likevel logge prompts og svar i en **begrenset
periode** for å oppdage og forhindre brudd på retningslinjer, ivareta sikkerheten i
tjenesten og oppfylle lovpålagte krav. Slike data kan lagres midlertidig eller caches i
land der Google eller Googles leverandører har teknisk infrastruktur.

## 6. Overføring utenfor EØS
Konto- og klippdata som lagres i Firestore, lagres i EU-regionen eur3. Ved bruk av
Gemini API via Google AI Studio / Cloud Billing kan prompts, Big Five-skårer, fritekst
og genererte svar likevel behandles eller lagres midlertidig **utenfor EØS, for
eksempel i USA**.

Når personopplysninger overføres utenfor EØS, skjer overføringen på gyldig
overføringsgrunnlag etter GDPR kapittel V. Dette omfatter **EUs standard
personvernbestemmelser (Standard Contractual Clauses / SCC)** og/eller **EU–US Data
Privacy Framework** der leverandøren er sertifisert og overføringen er omfattet. Vi
vurderer leverandørenes databehandlingsvilkår og overføringsgrunnlag før
personopplysninger behandles utenfor EØS.

## 7. Personlighetsopplysninger og AI-generert profil
Tjenesten behandler svar på personlighetsspørsmål og beregner Big Five-skårer. Dette
er personopplysninger som kan oppleves private, og vi behandler dem med særlig
varsomhet.

Big Five-skårene beskriver personlighetstrekk og atferdsmønstre. De er ikke ment å si
noe om helse, diagnose eller medisinsk tilstand. Vi ber ikke om helseopplysninger,
religiøs eller politisk oppfatning, fagforeningsmedlemskap, seksuell orientering eller
andre særlige kategorier personopplysninger etter GDPR artikkel 9. Du bør ikke skrive
inn slike opplysninger i fritekstfelt.

AI-funksjonen lager en skreddersydd debrief og øvingsprofil til din egen forberedelse.
Dette innebærer profilering i form av automatisert vurdering av personlige forhold. Vi
treffer likevel **ingen automatiserte avgjørelser med rettsvirkning** eller tilsvarende
vesentlig betydning for deg etter GDPR artikkel 22. Resultatet brukes bare som øvings-
og refleksjonsverktøy for deg selv. AI-genererte forklaringer kan inneholde feil og bør
leses som veiledende øvingsmateriale, ikke som fasit.

## 8. Mindreårige
Tjenesten er ikke ment for, eller rettet mot, personer under 18 år. Vi samler ikke
bevisst inn personopplysninger fra mindreårige. Hvis vi blir kjent med at en person
under 18 år har opprettet konto eller sendt inn personopplysninger, kan vi slette
kontoen og tilhørende data.

## 9. Lagringstid
- **Konto- og klippdata:** så lenge du har en aktiv konto. Slettes ved kontosletting.
- **Betalings- og kvitteringsdata:** 5 år, i tråd med bokføringsloven.
- **Server-logger (IP, tekniske logger):** slettes automatisk etter 30 dager, med mindre lengre lagring er nødvendig for å undersøke en konkret misbruks- eller sikkerhetshendelse.
- **Prompts/svar hos Google Gemini:** logges av Google kun i en begrenset periode for sikkerhet og lovkrav (se punkt 5).

## 10. Dine rettigheter
Du har rett til innsyn, retting, sletting, begrensning, dataportabilitet og å protestere
mot behandling basert på berettiget interesse. Du kan slette kontoen din ved å kontakte
oss på [e-post]. Du kan klage til **Datatilsynet** (datatilsynet.no) dersom du mener vår
behandling bryter med personvernregelverket.

## 11. Sikkerhet
Data overføres kryptert (HTTPS). Klippsaldo håndteres utelukkende server-side og kan
ikke endres fra nettleseren. Tilgang til driftssystemer er begrenset.

## 12. Informasjonskapsler og lokal lagring
Vi bruker **nødvendige** mekanismer for innlogging (Firebase Authentication benytter
cookies/lokal lagring) og `localStorage` for å lagre testen din lokalt. Vi bruker
**ingen** analyse- eller markedsføringskapsler.

## 13. Endringer
Vi kan oppdatere denne erklæringen. Vesentlige endringer varsles på [hvordan].

## 14. Kontakt
[Selskapsnavn], [e-post].
