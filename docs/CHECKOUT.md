# Checkout-samtykke + e-postkvittering – Big Five Forberedelse

> Spec for kjøpsflyten i Stripe. Bygges når den live betalingsflyten settes opp.

## 1. Tekst og bokser i checkout

Vis lenker til vilkår og personvern **synlig før** «Betal»-knappen.

```
Ved å fullføre kjøpet godtar du våre [brukervilkår] og bekrefter at du har lest
[personvernerklæringen].

☐  [Påkrevd] Umiddelbar levering og angrerett.
   Jeg ber uttrykkelig om at en AI-økt kan leveres umiddelbart når jeg starter den,
   også før angrefristen på 14 dager er utløpt, og jeg erkjenner at angreretten
   bortfaller for et klipp når det tas i bruk (angrerettloven § 22 n).

☐  [Frivillig] Ja, jeg vil motta e-post med tips om testforberedelse, nye funksjoner
   og relevante tilbud. Jeg kan melde meg av når som helst.

[ Betal [X] kr og få tilgang nå ]
```

## 2. Tekniske regler

| Element | Påkrevd? | Forhåndsavkrysset? |
|---|---|---|
| Vilkår/personvern (vist før kjøp) | Ja, vises før kjøp | Ingen boks – klikkbare lenker |
| Angrerett / umiddelbar levering | **Ja** | **Nei** |
| Markedsføring | **Nei** | **Nei** |
| Betalingsknapp | Deaktivert til angrerett-boksen er huket av | — |

- Betalingsknappen **må vise beløp og betalingsplikt**, f.eks. «Betal 99 kr» (jf. angrerettloven § 16 og Forbrukertilsynets veiledning).
- Markedsføringsboksen er separat og frivillig, aldri et vilkår for kjøp (mfl. § 15). Kan droppes helt i MVP.
- Ingen samtykkeboks skal være forhåndsavkrysset.

## 3. E-postkvittering (varig medium, jf. angrerettloven § 18)

Send automatisk etter godkjent betaling – via Stripe-webhook eller appens egen e-posttjeneste:

```
Emne: Bekreftelse på ditt kjøp – Big Five Forberedelse

Takk for kjøpet.

Du har kjøpt [X] klipp til Big Five Forberedelse for [X] kr (inkl. mva).

Klipp brukes til AI-økter (jobbanalyse eller øvingsintervju). En økt leveres
digitalt og umiddelbart når du starter den. I checkout ba du uttrykkelig om at
leveringen kan starte før angrefristen på 14 dager er utløpt, og du erkjente at
angreretten bortfaller for et klipp når det tas i bruk.

Refusjon: Har du ikke startet noen AI-økt på dette kjøpet, kan hele kjøpet refunderes
innen 14 dager – kontakt oss. Når du har startet din første økt, er kjøpet endelig.
Dette begrenser ikke lovfestede rettigheter ved feilbelastning eller teknisk feil.

Brukervilkår: [lenke]
Personvernerklæring: [lenke]

Spørsmål om kjøpet? Kontakt [support-e-post].
```

## 4. Sjekkliste før live
- [ ] Lenker til vilkår + personvern vises før «Betal»
- [ ] Angrerett-boks påkrevd, ikke forhåndsavkrysset, knapp deaktivert (`disabled`) til avhuket
- [ ] Knappetekst viser beløp («Betal X kr»)
- [ ] E-postkvittering (§ 18) sendes automatisk ved godkjent betaling
- [ ] Eventuell markedsføringsboks er separat og frivillig
