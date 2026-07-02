// De fem Big Five-dimensjonene. Brukt av all Big Five-spesifikk logikk
// (dimensionsData, bandsData, consistencyPairs, radar, AI-analyse osv.).
export type BigFiveKey = 'planmessighet' | 'emosjonell_stabilitet' | 'ekstroversjon' | 'omgjengelighet' | 'aapenhet';

// Integritet er en EGEN skala, ikke en Big Five-dimensjon. Den lever i samme
// `statements`-array (så spørreskjema/fremdrift/fullføring virker), men har ingen
// oppføring i dimensionsData/bandsData — den vises i sin egen seksjon i resultatene.
// DimensionKey brukes av de generiske skåre-funksjonene som håndterer begge deler.
export type DimensionKey = BigFiveKey | 'integritet';

export interface Statement {
  id: string;
  tekst: string;
  dimensjon: DimensionKey;
  keyed: 'positiv' | 'negativ';
}

export interface DimensionInfo {
  name: string;
  description: string;
  highDescription: string;
  lowDescription: string;
  comparison: string;
  example: string;
}

export interface BandContent {
  interpretation: string;
  strengths: string[];
  pitfalls: string[];
  reflectionQuestions: string[];
  interviewQuestions: string[];
  prompts: string[];
  honestAnswers: string[];
}

export const statements: Statement[] = [
  // --- Planmessighet (plan_) ---
  { id: 'plan_1', tekst: 'Jeg setter meg alltid tydelige mål for arbeidsdagen min.', dimensjon: 'planmessighet', keyed: 'positiv' },
  { id: 'plan_2', tekst: 'Jeg holder god orden i dokumenter og e-poster slik at andre lett kan finne frem.', dimensjon: 'planmessighet', keyed: 'positiv' },
  { id: 'plan_3', tekst: 'Jeg planlegger oppgaver god tid i forveien for å unngå stress mot tidsfrister.', dimensjon: 'planmessighet', keyed: 'positiv' },
  { id: 'plan_4', tekst: 'Jeg fullfører alltid oppgaver jeg har påtatt meg, selv om de er kjedelige.', dimensjon: 'planmessighet', keyed: 'positiv' },
  { id: 'plan_5', tekst: 'Jeg er nøye med detaljene i arbeidet mitt for å sikre høy kvalitet.', dimensjon: 'planmessighet', keyed: 'positiv' },
  { id: 'plan_6', tekst: 'Jeg liker å lage lister over hva som må gjøres og krysse dem av systematisk.', dimensjon: 'planmessighet', keyed: 'positiv' },
  { id: 'plan_7', tekst: 'Jeg hopper lett mellom oppgaver uten å fullføre det jeg startet på.', dimensjon: 'planmessighet', keyed: 'negativ' },
  { id: 'plan_8', tekst: 'Jeg synes detaljer ofte tar unødvendig mye plass i arbeidet.', dimensjon: 'planmessighet', keyed: 'negativ' },
  { id: 'plan_9', tekst: 'Jeg utsetter ofte oppgaver til siste øyeblikk hvis jeg kan.', dimensjon: 'planmessighet', keyed: 'negativ' },
  { id: 'plan_10', tekst: 'Jeg har en tendens til å miste fokus når jeg må jobbe med langsiktige prosjekter.', dimensjon: 'planmessighet', keyed: 'negativ' },
  { id: 'plan_11', tekst: 'Jeg tar ting litt som de kommer på jobb, uten en fast plan.', dimensjon: 'planmessighet', keyed: 'negativ' },
  { id: 'plan_12', tekst: 'Jeg glemmer av og til oppgaver eller avtaler hvis de ikke skrives ned med en gang.', dimensjon: 'planmessighet', keyed: 'negativ' },

  // --- Emosjonell stabilitet (emos_) ---
  { id: 'emos_1', tekst: 'Jeg beholder roen når det oppstår uforutsette problemer i et prosjekt.', dimensjon: 'emosjonell_stabilitet', keyed: 'positiv' },
  { id: 'emos_2', tekst: 'Jeg takler uventede tidsfrister eller hasteoppgaver uten å bli stresset.', dimensjon: 'emosjonell_stabilitet', keyed: 'positiv' },
  { id: 'emos_3', tekst: 'Jeg tar konstruktiv kritikk på en profesjonell måte uten å ta det personlig.', dimensjon: 'emosjonell_stabilitet', keyed: 'positiv' },
  { id: 'emos_4', tekst: 'Jeg klarer å koble av fra jobb når arbeidsdagen er over.', dimensjon: 'emosjonell_stabilitet', keyed: 'positiv' },
  { id: 'emos_5', tekst: 'Jeg føler meg trygg på egne evner og avgjørelser i arbeidshverdagen.', dimensjon: 'emosjonell_stabilitet', keyed: 'positiv' },
  { id: 'emos_6', tekst: 'Jeg lar meg sjelden påvirke av dårlig stemning eller stress rundt meg.', dimensjon: 'emosjonell_stabilitet', keyed: 'positiv' },
  { id: 'emos_7', tekst: 'Jeg bruker mye tid på å gruble etter kritiske tilbakemeldinger.', dimensjon: 'emosjonell_stabilitet', keyed: 'negativ' },
  { id: 'emos_8', tekst: 'Jeg opplever press som mer belastende enn kollegene mine ser ut til å gjøre.', dimensjon: 'emosjonell_stabilitet', keyed: 'negativ' },
  { id: 'emos_9', tekst: 'Jeg blir lett bekymret for om resultatet av arbeidet mitt er godt nok.', dimensjon: 'emosjonell_stabilitet', keyed: 'negativ' },
  { id: 'emos_10', tekst: 'Jeg kan føle meg usikker på egne prestasjoner hvis jeg ikke får hyppige tilbakemeldinger.', dimensjon: 'emosjonell_stabilitet', keyed: 'negativ' },
  { id: 'emos_11', tekst: 'Jeg synes det er vanskelig å omstille meg når planene endres i siste liten.', dimensjon: 'emosjonell_stabilitet', keyed: 'negativ' },
  { id: 'emos_12', tekst: 'Jeg tar ofte med meg bekymringer fra jobben hjem etter arbeidstid.', dimensjon: 'emosjonell_stabilitet', keyed: 'negativ' },

  // --- Ekstroversjon (ekst_) ---
  { id: 'ekst_1', tekst: 'Jeg tar gjerne ordet i store fellesmøter for å dele mine synspunkter.', dimensjon: 'ekstroversjon', keyed: 'positiv' },
  { id: 'ekst_2', tekst: 'Jeg får energi av å jobbe tett sammen med andre kolleger i team.', dimensjon: 'ekstroversjon', keyed: 'positiv' },
  { id: 'ekst_3', tekst: 'Jeg tar ofte initiativet til sosiale aktiviteter eller pauser med kolleger.', dimensjon: 'ekstroversjon', keyed: 'positiv' },
  { id: 'ekst_4', tekst: 'Jeg trives godt med å holde presentasjoner eller lede arbeidsmøter.', dimensjon: 'ekstroversjon', keyed: 'positiv' },
  { id: 'ekst_5', tekst: 'Jeg oppsøker aktivt nye samarbeidspartnere internt eller eksternt i organisasjonen.', dimensjon: 'ekstroversjon', keyed: 'positiv' },
  { id: 'ekst_6', tekst: 'Jeg deler gjerne uferdige ideer høyt for å få innspill fra andre.', dimensjon: 'ekstroversjon', keyed: 'positiv' },
  { id: 'ekst_7', tekst: 'Jeg blir ofte tappet av lange perioder med mye sosial kontakt.', dimensjon: 'ekstroversjon', keyed: 'negativ' },
  { id: 'ekst_8', tekst: 'Jeg foretrekker å jobbe stille for meg selv fremfor å tenke høyt med andre.', dimensjon: 'ekstroversjon', keyed: 'negativ' },
  { id: 'ekst_9', tekst: 'Jeg foretrekker å jobbe alene uten forstyrrelser fra kolleger.', dimensjon: 'ekstroversjon', keyed: 'negativ' },
  { id: 'ekst_10', tekst: 'Jeg synes det er slitsomt å måtte forholde meg til mange nye mennesker i løpet av en arbeidsdag.', dimensjon: 'ekstroversjon', keyed: 'negativ' },
  { id: 'ekst_11', tekst: 'Jeg foretrekker å sende en e-post fremfor å ringe eller gå bort til kolleger.', dimensjon: 'ekstroversjon', keyed: 'negativ' },
  { id: 'ekst_12', tekst: 'Jeg holder meg gjerne i bakgrunnen i store diskusjoner og møter.', dimensjon: 'ekstroversjon', keyed: 'negativ' },

  // --- Omgjengelighet (omgj_) ---
  { id: 'omgj_1', tekst: 'Jeg strekker meg langt for å hjelpe en kollega som har mye å gjøre.', dimensjon: 'omgjengelighet', keyed: 'positiv' },
  { id: 'omgj_2', tekst: 'Jeg lytter tålmodig til andres synspunkter, selv når jeg er uenig.', dimensjon: 'omgjengelighet', keyed: 'positiv' },
  { id: 'omgj_3', tekst: 'Jeg stoler på at kollegene mine gjør sitt beste og har gode hensikter.', dimensjon: 'omgjengelighet', keyed: 'positiv' },
  { id: 'omgj_4', tekst: 'Jeg bidrar aktivt til å skape en hyggelig og inkluderende stemning på jobb.', dimensjon: 'omgjengelighet', keyed: 'positiv' },
  { id: 'omgj_5', tekst: 'Jeg søker gjerne kompromisser for å løse uenigheter i et team.', dimensjon: 'omgjengelighet', keyed: 'positiv' },
  { id: 'omgj_6', tekst: 'Jeg roser kollegene mine når de gjør en god jobb eller oppnår resultater.', dimensjon: 'omgjengelighet', keyed: 'positiv' },
  { id: 'omgj_7', tekst: 'Jeg synes folk ofte må tåle harde tilbakemeldinger uten så mye forklaring.', dimensjon: 'omgjengelighet', keyed: 'negativ' },
  { id: 'omgj_8', tekst: 'Jeg prioriterer å få rett i en sak fremfor å ta hensyn til stemningen i gruppen.', dimensjon: 'omgjengelighet', keyed: 'negativ' },
  { id: 'omgj_9', tekst: 'Jeg prioriterer egne oppgaver fremfor å hjelpe andre hvis jeg har dårlig tid.', dimensjon: 'omgjengelighet', keyed: 'negativ' },
  { id: 'omgj_10', tekst: 'Jeg havner av og til i diskusjoner fordi jeg er veldig direkte i min kommunikasjonsstil.', dimensjon: 'omgjengelighet', keyed: 'negativ' },
  { id: 'omgj_11', tekst: 'Jeg kan være skeptisk til motiver hvis en kollega plutselig endrer mening.', dimensjon: 'omgjengelighet', keyed: 'negativ' },
  { id: 'omgj_12', tekst: 'Jeg mener at resultater er viktigere enn å unngå konflikter i et team.', dimensjon: 'omgjengelighet', keyed: 'negativ' },

  // --- Åpenhet (aape_) ---
  { id: 'aape_1', tekst: 'Jeg oppsøker gjerne nye metoder og verktøy for å effektivisere arbeidet mitt.', dimensjon: 'aapenhet', keyed: 'positiv' },
  { id: 'aape_2', tekst: 'Jeg blir engasjert av å diskutere abstrakte teorier eller langsiktige strategier.', dimensjon: 'aapenhet', keyed: 'positiv' },
  { id: 'aape_3', tekst: 'Jeg trives med å jobbe på tvers av ulike fagfelt og tilegne meg ny kunnskap.', dimensjon: 'aapenhet', keyed: 'positiv' },
  { id: 'aape_4', tekst: 'Jeg foreslår ofte alternative løsninger på etablerte problemer på jobb.', dimensjon: 'aapenhet', keyed: 'positiv' },
  { id: 'aape_5', tekst: 'Jeg blir inspirert av kreative idemyldringer og utradisjonelle konsepter.', dimensjon: 'aapenhet', keyed: 'positiv' },
  { id: 'aape_6', tekst: 'Jeg liker å analysere komplekse problemstillinger fra ulike vinkler.', dimensjon: 'aapenhet', keyed: 'positiv' },
  { id: 'aape_7', tekst: 'Jeg unngår ofte oppgaver som krever at jeg må lære noe helt nytt.', dimensjon: 'aapenhet', keyed: 'negativ' },
  { id: 'aape_8', tekst: 'Jeg synes ofte nye ideer skaper mer uro enn verdi.', dimensjon: 'aapenhet', keyed: 'negativ' },
  { id: 'aape_9', tekst: 'Jeg foretrekker kjente og utprøvde metoder fremfor å eksperimentere med nye ting på jobb.', dimensjon: 'aapenhet', keyed: 'negativ' },
  { id: 'aape_10', tekst: 'Jeg synes det er unødvendig å bruke tid på å diskutere teorier som ikke har direkte praktisk nytte.', dimensjon: 'aapenhet', keyed: 'negativ' },
  { id: 'aape_11', tekst: 'Jeg liker best oppgaver med klare, faste rammer som ikke endrer seg underveis.', dimensjon: 'aapenhet', keyed: 'negativ' },
  { id: 'aape_12', tekst: 'Jeg foretrekker å konsentrere meg strengt om mitt eget fagområde fremfor å lære om andres.', dimensjon: 'aapenhet', keyed: 'negativ' },

  // --- Integritet (integ_) — EGEN skala, ikke Big Five. Måler pålitelighet,
  //     risikoholdning og etisk dømmekraft via indirekte + direkte påstander.
  //     Egne formuleringer. Høy skår (etter reversering) = høy pålitelighet. ---
  // Indirekte (personlighetsorienterte)
  { id: 'integ_1', tekst: 'Folk kan stole på at jeg gjør akkurat det jeg har lovet.', dimensjon: 'integritet', keyed: 'positiv' },
  { id: 'integ_2', tekst: 'Jeg holder orden på ting jeg har ansvar for, også når ingen kontrollerer meg.', dimensjon: 'integritet', keyed: 'positiv' },
  { id: 'integ_3', tekst: 'Jeg liker å ta sjanser i hverdagen, selv når utfallet er usikkert.', dimensjon: 'integritet', keyed: 'negativ' },
  { id: 'integ_4', tekst: 'Jeg handler ofte på impuls uten å tenke gjennom konsekvensene.', dimensjon: 'integritet', keyed: 'negativ' },
  { id: 'integ_5', tekst: 'Jeg synes regler ofte er til for å brytes når de står i veien.', dimensjon: 'integritet', keyed: 'negativ' },
  { id: 'integ_6', tekst: 'Jeg tar gjerne en snarvei hvis det sparer meg tid, selv om det bryter med rutinen.', dimensjon: 'integritet', keyed: 'negativ' },
  // Direkte (åpne holdningsspørsmål)
  { id: 'integ_7', tekst: 'De fleste mennesker er ærlige og til å stole på.', dimensjon: 'integritet', keyed: 'positiv' },
  { id: 'integ_8', tekst: 'Ærlighet er viktigere for meg enn å fremstå perfekt.', dimensjon: 'integritet', keyed: 'positiv' },
  { id: 'integ_9', tekst: 'Jeg ville meldt fra dersom jeg oppdaget at en kollega underslo penger.', dimensjon: 'integritet', keyed: 'positiv' },
  { id: 'integ_10', tekst: 'Litt fusk eller juks på jobb er egentlig ikke så farlig.', dimensjon: 'integritet', keyed: 'negativ' },
  { id: 'integ_11', tekst: 'Om anledningen bød seg, kunne jeg tatt med meg en ting av liten verdi fra arbeidsplassen.', dimensjon: 'integritet', keyed: 'negativ' },
  { id: 'integ_12', tekst: 'Alle pynter litt på sannheten i et jobbintervju.', dimensjon: 'integritet', keyed: 'negativ' }
];

export const dimensionsData: Record<BigFiveKey, DimensionInfo> = {
  planmessighet: {
    name: 'Planmessighet',
    description: 'Handler om din tendens til struktur, disiplin, orden og pålitelighet i oppgaveutførelse.',
    highDescription: 'Meget strukturert, grundig, detaljorientert og disiplinert. Setter seg tydelige mål og leverer alltid til avtalt tid.',
    lowDescription: 'Mer fleksibel, spontan, uformell og tilpasningsdyktig. Trives i dynamiske situasjoner der man kan ta ting på sparket.',
    comparison: 'Mens en høyt planmessig person trives best med faste planer og detaljerte planer, vil en person med lav planmessighet lettere omstille seg og improvisere når rammene endrer seg.',
    example: 'En person med høy planmessighet utarbeider et detaljert ukesskjema mandag morgen. En person med lav planmessighet fokuserer på den mest brennende saken akkurat nå og håndterer uforutsette ting underveis.'
  },
  emosjonell_stabilitet: {
    name: 'Emosjonell stabilitet',
    description: 'Handler om din evne til å tåle stress, motgang og holde hodet kaldt under press.',
    highDescription: 'Rolig, stabil og robust i møte med stress og uventede hindringer. Blir sjelden vippet av pinnen av kritikk.',
    lowDescription: 'Sensitiv, engasjert, årvåken for risiko og reagerer raskt. Tar ofte ting personlig og føler på sterkt ansvar.',
    comparison: 'Høy emosjonell stabilitet gir solid ro i kriser, mens lav stabilitet (høy sensitivitet) gjør deg raskere til å oppdage feil og risiko som andre overser, selv om det kan øke det indre stressnivået.',
    example: 'Når et kritisk system krasjer, vil den emosjonelt stabile personen rolig konstatere situasjonen og feilsøke systematisk. Den sensitive personen merker alvoret øyeblikkelig, setter i gang krisetiltak og dobbeltsjekker alle marginer.'
  },
  ekstroversjon: {
    name: 'Ekstroversjon',
    description: 'Handler om hvor du henter sosial energi fra, din grad av utadvendthet og initiativ.',
    highDescription: 'Utadvendt, sosialt initiativrik, energisk og uredd for oppmerksomhet. Trives med å tenke høyt sammen med andre.',
    lowDescription: 'Innadvendt, ettertenksom, uavhengig og trives best med dyp konsentrasjon alene eller i små grupper.',
    comparison: 'En høyt ekstrovert person henter motivasjon og energi fra samhandling og nettverksbygging, mens en introvert person foretrekker grundige dypdykk uten konstante avbrytelser.',
    example: 'Under et idémøte vil en ekstrovert person begynne å snakke med en gang og sparre høyt. En introvert person vil lytte, bearbeide tankene sine, og gjerne levere et gjennomtenkt skriftlig forslag etter møtet.'
  },
  omgjengelighet: {
    name: 'Omgjengelighet',
    description: 'Handler om din innstilling til samarbeid, tillit til andre, og vilje til å søke harmoni.',
    highDescription: 'Varm, empatisk, imøtekommende og opptatt av at alle skal trives. Søker alltid kompromisser og gode relasjoner.',
    lowDescription: 'Direkte, saklig, konkurranseorientert og skeptisk. Setter saklige resultater foran å unngå diskusjoner.',
    comparison: 'Høy omgjengelighet fungerer utmerket som sosialt lim i teamet, mens en lavere skår gjør det lettere å stille ubehagelige spørsmål og ta upopulære beslutninger.',
    example: 'Når en prosjektgruppe diskuterer en svak plan, vil en høyt omgjengelig person prøve å tilpasse seg for å unngå dårlig stemning. En person med lavere omgjengelighet vil påpeke svakhetene direkte og kreve at saken rettes opp.'
  },
  aapenhet: {
    name: 'Åpenhet for erfaring',
    description: 'Handler om intellektuell nysgjerrighet, kreativitet, fantasi og vilje til endring.',
    highDescription: 'Nysgjerrig, oppfinnsom, glad i komplekse konsepter og teorier. Ser etter nye måter å løse oppgaver på.',
    lowDescription: 'Praktisk, jordnær, fokusert på detaljer her og nå. Verdsetter velprøvde metoder som beviselig fungerer.',
    comparison: 'En høyt åpen person drives av innovasjon og å tenke utenfor boksen, mens en mer tradisjonell person sikrer god operasjonell drift og unngår urealistiske visjoner.',
    example: 'Når en ny oppgave skal løses, foreslår en åpen person å teste ut et nytt digitalt verktøy de har lest om. En mer praktisk orientert person påpeker at den eksisterende regnearkmalen løser oppgaven helt fint og trygt på fem minutter.'
  }
};

/**
 * Normalize a free-text dimension label to a comparable ASCII slug.
 * Handles Norwegian characters (å→aa, ø→o, æ→ae) and any punctuation/casing.
 */
const normalizeDimensionLabel = (raw: string): string =>
  raw
    .toLowerCase()
    .trim()
    .replace(/å/g, 'aa')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

/**
 * Robustly resolve a DimensionKey from arbitrary AI/model output. The model is
 * instructed to use the ASCII keys (e.g. 'aapenhet'), but often returns variants
 * like 'åpenhet', 'Åpenhet for erfaring' or 'emosjonell stabilitet'. Returns
 * undefined if nothing plausibly matches.
 */
export const resolveDimensionKey = (raw: string): DimensionKey | undefined => {
  if (!raw || typeof raw !== 'string') return undefined;
  const n = normalizeDimensionLabel(raw);
  if (!n) return undefined;

  const keys = Object.keys(dimensionsData) as DimensionKey[];

  // 1. Exact key match.
  const exact = keys.find((k) => k === n);
  if (exact) return exact;

  // 2. Match against key or display name with prefix/containment tolerance.
  for (const k of keys) {
    const nk = normalizeDimensionLabel(k);
    const nn = normalizeDimensionLabel(dimensionsData[k].name);
    if (
      n === nk ||
      n === nn ||
      n.startsWith(nk) ||
      nk.startsWith(n) ||
      nn.startsWith(n) ||
      n.startsWith(nn) ||
      nn.includes(n) ||
      n.includes(nn)
    ) {
      return k;
    }
  }

  return undefined;
};

export const consistencyPairs: {
  dimensjon: BigFiveKey;
  st1Id: string;
  st2Id: string;
  label: string;
}[] = [
  {
    dimensjon: 'planmessighet',
    st1Id: 'plan_3', // Jeg planlegger oppgaver god tid i forveien for å unngå stress mot tidsfrister. (positiv)
    st2Id: 'plan_9', // Jeg utsetter ofte oppgaver til siste øyeblikk hvis jeg kan. (negativ)
    label: 'Tidsplanlegging vs. Prokrastinering'
  },
  {
    dimensjon: 'emosjonell_stabilitet',
    st1Id: 'emos_4', // Jeg klarer å koble av fra jobb når arbeidsdagen er over. (positiv)
    st2Id: 'emos_12', // Jeg tar ofte med meg bekymringer fra jobben hjem etter arbeidstid. (negativ)
    label: 'Avkobling vs. Bekymringsimport'
  },
  {
    dimensjon: 'ekstroversjon',
    st1Id: 'ekst_2', // Jeg får energi av å jobbe tett sammen med andre kolleger i team. (positiv)
    st2Id: 'ekst_9', // Jeg foretrekker å jobbe alene uten forstyrrelser fra kolleger. (negativ)
    label: 'Sosial teamenergi vs. Konsentrert soloarbeid'
  },
  {
    dimensjon: 'omgjengelighet',
    st1Id: 'omgj_1', // Jeg strekker meg langt for å hjelpe en kollega som har mye å gjøre. (positiv)
    st2Id: 'omgj_9', // Jeg prioriterer egne oppgaver fremfor å hjelpe andre hvis jeg har dårlig tid. (negativ)
    label: 'Hjelpsomhet vs. Egenprioritering'
  },
  {
    dimensjon: 'aapenhet',
    st1Id: 'aape_1', // Jeg oppsøker gjerne nye metoder og verktøy for å effektivisere arbeidet mitt. (positiv)
    st2Id: 'aape_9', // Jeg foretrekker kjente og utprøvde metoder fremfor å eksperimentere med nye ting på jobb. (negativ)
    label: 'Nysgjerrig utforskning vs. Trygg etablert praksis'
  }
];

export const bandsData: Record<BigFiveKey, Record<'Lav' | 'Moderat' | 'Høy', BandContent>> = {
  planmessighet: {
    Lav: {
      interpretation: 'Du trives best i fleksible og dynamiske omgivelser hvor rammene ikke er for strenge. Du foretrekker å ta utfordringer som de kommer fremfor å følge en rigid plan.',
      strengths: [
        'Høy tilpasningsdyktighet og evne til å snu seg raskt ved uforutsette endringer.',
        'Kreativ og oppfinnsom i uventede situasjoner.',
        'Tåler løse tråder, kaos og uklare rammer svært godt.'
      ],
      pitfalls: [
        'Kan miste oversikten over viktige tidsfrister.',
        'Kan synes detaljarbeid, rapportering og faste rutineoppgaver er kjedelig eller slitsomt.',
        'Kan fremstå som uorganisert eller uforutsigbar for kolleger som krever ekstrem struktur.'
      ],
      reflectionQuestions: [
        'Hvordan kan du vise en arbeidsgiver at du har kontroll på kritiske tidsfrister, tross din fleksible stil?',
        'I hvilke spesifikke situasjoner har din evne til å improvisere reddet et prosjekt?'
      ],
      interviewQuestions: [
        'I denne stillingen har vi mange faste tidsfrister og rutiner. Kan du fortelle om en gang du måtte strukturere arbeidet ditt nøye for å komme i mål?',
        'Hvordan sikrer du at din fleksibilitet ikke fører til at du overser viktige detaljer?'
      ],
      prompts: [
        'Tenk på et digitalt verktøy eller en enkel rutine du bruker aktivt for å holde kontrollen i hverdagen.',
        'Reflekter over en gang du bevisst tok på deg ansvaret for en kjedelig, men kritisk detaljoppgave.'
      ],
      honestAnswers: [
        'Jeg trives best når jeg kan jobbe dynamisk og tilpasse meg raskt til endringer. Samtidig er jeg fullstendig klar over at detaljer og frister er avgjørende på en arbeidsplass. Derfor bruker jeg digitale kalendere og påminnelser aktivt for å sikre at min uformelle stil aldri går på bekostning av faste avtaler eller leveranser.',
        'Jeg er nok mer pragmatisk enn rigid i min tilnærming til oppgaver. Når planene må endres i siste liten, blir jeg ikke stresset – jeg ser heller etter kreative måter å løse det på der og da. For å sikre at jeg ikke glemmer de mindre morsomme oppgavene, gjør jeg det til en vane å starte dagen med å fullføre dem først.'
      ]
    },
    Moderat: {
      interpretation: 'Du har en balansert tilnærming til planlegging og fleksibilitet. Du setter pris på en viss struktur, men blir ikke satt ut om planene må endres.',
      strengths: [
        'Balansert og pragmatisk arbeidsstil.',
        'Evner å planlegge oppgaver på en god måte, men er samtidig fleksibel nok til å justere kursen underveis.',
        'Både pålitelig i leveranser og rimelig omstillingsdyktig.'
      ],
      pitfalls: [
        'Kan i perioder med ekstremt høyt press svinge mellom å være for rigid eller for ustrukturert.',
        'Kan havne i klemme mellom kolleger som krever ekstrem detaljstyring og de som vil ha total frihet.'
      ],
      reflectionQuestions: [
        'I hvilke situasjoner merker du at du heller mer mot det strukturerte, og når velger du en mer pragmatisk tilnærming?',
        'Hvordan kommuniserer du dine planer til andre?'
      ],
      interviewQuestions: [
        'Hvordan balanserer du behovet for struktur med behovet for å være fleksibel når uventede ting skjer på jobb?',
        'Fortell om en gang du måtte planlegge et prosjekt og tilpasse det underveis.'
      ],
      prompts: [
        'Identifiser en nylig situasjon der du planla godt, men måtte justere underveis. Hva lærte du?',
        'Tenk på hvordan du organiserer e-posten eller oppgavelisten din.'
      ],
      honestAnswers: [
        'Jeg foretrekker å ha en overordnet plan for arbeidet mitt for å sikre kvaliteten og unngå unødig stress, men jeg vet også at hverdagen endrer seg raskt. Jeg forsøker å planlegge kjerneoppgavene godt, men setter alltid av litt buffer til uforutsette hendelser slik at jeg kan snu meg uten at det går utover kvaliteten.',
        'Min stil er strukturert, men ikke rigid. Jeg liker å ha lister og holde orden, men hvis en kollega kommer med en hasteoppgave eller prioriteringene endres, tar jeg det med godt humør og tilpasser dagsplanen min.'
      ]
    },
    Høy: {
      interpretation: 'Du er svært strukturert, pålitelig og målrettet. Du legger stor vekt på detaljer, kvalitet og å holde avtaler og frister.',
      strengths: [
        'Eksepsjonell gjennomføringskraft og systematisk oppgavehåndtering.',
        'Høy kvalitetssikring og minimalisering av risiko i leveranser.',
        'Svært pålitelig; kolleger og ledere vet nøyaktig hva de får og når de får det.'
      ],
      pitfalls: [
        'Kan bli for rigid og motvillig til nødvendige kursendringer.',
        'Kan bruke unødvendig mye tid på uvesentlige detaljer (perfeksjonisme).',
        'Fare for utålmodighet eller irritasjon overfor kolleger som arbeider mer spontant eller ustrukturert.'
      ],
      reflectionQuestions: [
        'Hvordan kan du best takle situasjoner der uforutsette endringer krever at du må kaste den opprinnelige planen din?',
        'Hvordan kan du uttrykke din sans for struktur uten å virke kontrollerende overfor andre?'
      ],
      interviewQuestions: [
        'Vi opplever ofte raske endringer i prioriteringer her. Kan du gi et eksempel på en gang du måtte gi slipp på en plan du hadde lagt, og hvordan du taklet det?',
        'Hvordan skiller du mellom detaljer som er kritiske for kvaliteten, og detaljer som bare forsinker prosessen?'
      ],
      prompts: [
        'Reflekter over en situasjon der din grundighet og nøyaktighet reddet teamet fra en pinlig feil.',
        'Tenk på hvordan du kan forklare til en leder at du setter pris på planer, men takler fleksibilitet.'
      ],
      honestAnswers: [
        'Jeg legger min stolthet i å levere grundig arbeid av høy kvalitet til avtalt tid. Siden jeg er veldig strukturert, fungerer jeg godt som en garantist for at prosjekter kommer trygt i mål. Samtidig er jeg bevisst på at perfeksjonisme kan ta for mye tid, så jeg øver meg aktivt på å definere hva som er "godt nok" og akseptere raske endringer.',
        'For meg handler struktur om å frigjøre mental kapasitet. Ved å ha gode systemer i bunn, håndterer jeg faktisk uforutsette hendelser bedre, fordi jeg vet nøyaktig hva som må flyttes på for å gjøre plass til det nye.'
      ]
    }
  },
  emosjonell_stabilitet: {
    Lav: {
      interpretation: 'Du er en sensitiv, samvittighetsfull og engasjert person som reagerer raskt på endringer i omgivelsene. Du oppfatter risiko tidlig, men kan oppleve stress i hektiske perioder.',
      strengths: [
        'Høy årvåkenhet og evne til å fange opp potensielle problemer og risikoer før andre.',
        'Sterkt personlig engasjement og eierskap til oppgavene dine.',
        'Grundig refleksjon rundt konsekvenser før beslutninger tas.'
      ],
      pitfalls: [
        'Kan lett bli overveldet av høyt arbeidspress eller uventet motgang.',
        'Kan bekymre deg unødig mye for ting du ikke har direkte kontroll over.',
        'Kan ta faglige uenigheter eller konstruktiv kritikk personlig.'
      ],
      reflectionQuestions: [
        'Hvilke konkrete strategier bruker du for å koble av fra jobb og unngå at bekymringer tar for mye plass etter arbeidstid?',
        'Hvordan kan du bruke din årvåkenhet som en ressurs i teamet uten å skape unødig uro?'
      ],
      interviewQuestions: [
        'I denne jobben kan det oppstå intense og uforutsigbare dager. Hvordan kjenner du at stresset påvirker deg, og hva gjør du for å håndtere det?',
        'Hvordan takler du det dersom du får en tilbakemelding på at en leveranse ikke holdt mål?'
      ],
      prompts: [
        'Tenk på en gang du oppdaget en stor feil tidlig fordi du var bekymret og dobbeltsjekket arbeidet.',
        'Identifiser en aktivitet utenfor jobben som gir deg fullstendig mental avkobling.'
      ],
      honestAnswers: [
        'Jeg bryr meg genuint om resultatene mine, noe som gjør at jeg alltid er årvåken for feil og risikoer. Noen ganger kan dette skape et visst indre press, men jeg har lært meg å bruke det konstruktivt. Jeg håndterer det ved å være i forkant med planleggingen, samt ha en åpen dialog med lederen min hvis arbeidsmengden hoper seg opp.',
        'Jeg er en engasjert person som tar arbeidet mitt på alvor. Hvis det oppstår uventede utfordringer, reagerer jeg raskt for å finne løsninger. For å holde stresset nede, har jeg blitt flink til å skrive ned oppgavene systematisk og fokusere på én ting av gangen.'
      ]
    },
    Moderat: {
      interpretation: 'Du takler de fleste normale stressituasjoner på en god måte, men kan oppleve press og bekymring når belastningen blir uvanlig høy over tid.',
      strengths: [
        'Balansert og realistisk følelsesliv på jobb.',
        'Beholder fatningen under normalt tidspress, men mister ikke kontakten med alvoret i situasjonen.',
        'Er reflektert og tar hensyn til følelser hos deg selv og andre.'
      ],
      pitfalls: [
        'Kan under langvarig, uavbrutt press miste overskuddet og bli mer sårbar enn vanlig.',
        'Kan av og til nøle med å si klart fra når grensen for din kapasitet er nådd.'
      ],
      reflectionQuestions: [
        'Hvordan merker du forskjell på sunt arbeidspress og skadelig stress i din egen hverdag?',
        'Hva trenger du fra en leder for å føle deg trygg i perioder med mye endring?'
      ],
      interviewQuestions: [
        'Kan du gi et eksempel på en arbeidssituasjon som ble spesielt stressende for deg, og hvordan du navigerte i den?',
        'Hvordan sikrer du at du tar vare på dine egne grenser når tempoet blir høyt?'
      ],
      prompts: [
        'Tenk på en stressende situasjon der du klarte å roe ned en stresset kollega ved å dele din egen avbalanserte tilnærming.',
        'Reflekter over hvordan din stressmestring har utviklet seg gjennom din yrkeskarriere.'
      ],
      honestAnswers: [
        'Jeg beholder generelt roen i arbeidshverdagen og lar meg sjelden stresse av hverdagsutfordringer. Hvis presset blir ekstraordinært over lengre tid, fokuserer jeg på å strukturere oppgavene mine, prioritere hardt sammen med lederen min, og sørge for god restitusjon på fritiden.',
        'Jeg anser meg selv som ganske robust, men jeg har også stor respekt for mine egne grenser. Jeg vet at for å levere god kvalitet over tid, må jeg si fra hvis arbeidsmengden blir uforsvarlig. Det gjør jeg på en saklig og løsningsorientert måte.'
      ]
    },
    Høy: {
      interpretation: 'Du er svært robust, rolig og emosjonelt stabil. Du lar deg sjelden vippe av pinnen av uforutsette problemer, og takler høyt arbeidspress med stor fatning.',
      strengths: [
        'Eksepsjonell ro under press og evne til å tenke rasjonelt når det stormer.',
        'Stabil, forutsigbar og trygg adferd i krevende situasjoner.',
        'Tåler negative tilbakemeldinger og motgang uten å miste motivasjonen eller troen på deg selv.'
      ],
      pitfalls: [
        'Kan fremstå som upåvirket, uengasjert eller følelsesmessig fjern for kolleger som opplever sterkt stress.',
        'Kan ha en tendens til å bagatellisere reelle risikoer eller utsette tiltak fordi du tenker at "det ordner seg".',
        'Kan overse subtile stress-signaler hos kolleger rundt deg.'
      ],
      reflectionQuestions: [
        'Hvordan kan du sikre at din indre ro ikke tolkes som mangel på engasjement eller alvor av kollegene dine?',
        'Hvordan kan du aktivt støtte mer sensitive kolleger i stressende perioder uten å virke belærende?'
      ],
      interviewQuestions: [
        'Siden du sjelden blir stresset, hvordan sikrer du at du fanger opp når et prosjekt faktisk er i ferd med å gå galt, eller når kollegene dine sliter?',
        'Kan du fortelle om en akutt krisesituasjon på jobb der du måtte handle raskt og rolig?'
      ],
      prompts: [
        'Tenk på en gang din ro smittet over på et helt team i en kritisk situasjon.',
        'Reflekter over forskjellen på å være "rolig" og å være "likegyldig", og hvordan du kommuniserer dette.'
      ],
      honestAnswers: [
        'Jeg har en naturlig ro som gjør at jeg fungerer veldig godt under press. Når uforutsette problemer oppstår, fokuserer jeg instinktivt på løsninger fremfor bekymring. Samtidig er jeg bevisst på at min ro ikke må fremstå som likegyldighet overfor kolleger som føler presset sterkere, så jeg er nøye med å lytte og ta deres bekymringer på alvor.',
        'Jeg blir sjelden stresset av tidsfrister eller endringer. Jeg ser på det som min styrke at jeg kan være et anker i teamet når det stormer. For å sikre at jeg ikke overser risiko, støtter jeg meg på faglige analyser, data og innspill fra kolleger som kanskje har et mer årvåkent blikk enn meg.'
      ]
    }
  },
  ekstroversjon: {
    Lav: {
      interpretation: 'Du er mer introvert og trives best med selvstendig arbeid eller dype samtaler i mindre grupper. Du foretrekker å tenke deg godt om før du uttaler deg.',
      strengths: [
        'Sterk evne til dyp konsentrasjon og selvstendig arbeid uten behov for konstant ytre stimuli.',
        'Grundig bearbeidelse av informasjon før beslutninger tas.',
        'God og lyttende kollega som foretrekker substans fremfor overfladisk prat.'
      ],
      pitfalls: [
        'Kan fremstå som reservert, uinteressert eller vanskelig å bli kjent med.',
        'Kan vegre deg for å ta ordet i store forsamlinger eller presentere ideer uformelt.',
        'Kan bruke for lang tid i din egen tankeprosess i stedet for å sparre underveis.'
      ],
      reflectionQuestions: [
        'Hvordan kan du best forberede deg til å formidle dine bidrag i viktige fellesmøter uten at det føles overveldende?',
        'Hva slags sosiale rammer på kontoret gjør at du klarer å lade batteriene best?'
      ],
      interviewQuestions: [
        'I denne rollen vil du samarbeide mye på tvers av avdelinger. Hvordan opplever du det å skulle bygge nettverk med mange nye mennesker?',
        'Hvordan sikrer du at dine gode ideer blir hørt i et miljø med mange høylytte og utadvendte kolleger?'
      ],
      prompts: [
        'Tenk på en suksess du har oppnådd som skyldes at du jobbet fokusert, grundig og selvstendig over tid.',
        'Reflekter over hvordan du foretrekker å gi og få tilbakemeldinger.'
      ],
      honestAnswers: [
        'Jeg er en person som foretrekker å tenke grundig igjennom ting før jeg uttaler meg, og jeg trives svært godt med konsentrert arbeid. Jeg samarbeider gjerne tett med andre, men foretrekker ofte en-til-en-samtaler der vi kan gå i dybden, fremfor ustrukturerte fellesmøter.',
        'Som en mer ettertenksom type tar jeg sjelden ordet bare for å snakke. Når jeg først uttaler meg, er det fordi jeg har analysert saken ordentlig og har et gjennomtenkt bidrag. Jeg har lært meg å bruke skriftlige notater foran viktige møter for å sikre at mine poeng blir lagt frem.'
      ]
    },
    Moderat: {
      interpretation: 'Du er fleksibel i din sosiale adferd. Du trives i sosiale sammenhenger og kan ta ordet når det trengs, men setter også stor pris på uforstyrret arbeidstid.',
      strengths: [
        'Svært fleksibel sosial profil (ofte kalt ambivert).',
        'Kan både samarbeide energisk i team og trekke deg tilbake for å jobbe fokusert og selvstendig.',
        'Tilpasser deg enkelt ulike sosiale settinger uten å tappe deg helt for krefter.'
      ],
      pitfalls: [
        'Kan i perioder føle deg splittet mellom sosiale forventninger og ditt eget behov for ro.',
        'Kan bli misforstått som enten veldig utadvendt eller veldig reservert, avhengig av hvilken dagsform du viser.'
      ],
      reflectionQuestions: [
        'Hvilke spesifikke oppgaver gir deg mest energi – de sosiale og utadvendte, eller de uforstyrrede og analytiske?',
        'Hvordan fordeler du energien din gjennom en travel arbeidsuke?'
      ],
      interviewQuestions: [
        'Trives du best med å tenke høyt sammen med andre i et rom, eller vil du helst utforme ideen din ferdig før du presenterer den for kolleger?',
        'Hvordan håndterer du dager som utelukkende består av møter?'
      ],
      prompts: [
        'Tenk på en nylig arbeidsuke der du opplevde en perfekt balanse mellom samarbeid og uforstyrret arbeidstid. Hva kjennetegnet den?',
        'Reflekter over din evne til å lytte vs. din evne til å tale.'
      ],
      honestAnswers: [
        'Jeg ser på meg selv som en fleksibel lagspiller. Jeg deltar gjerne aktivt i diskusjoner og workshops for å sparre med andre og bygge relasjoner, men jeg har også et reelt behov for å trekke meg tilbake for å sitte uforstyrret og fullføre oppgavene mine med høy nøyaktighet.',
        'Jeg tilpasser meg lett omstendighetene. Hvis rollen krever at jeg holder en presentasjon eller leder et møte, gjør jeg det med glede og engasjement. På mer rolige dager bruker jeg tiden til å dypdykke i komplekse problemer på egen hånd.'
      ]
    },
    Høy: {
      interpretation: 'Du er en utadvendt, energisk og initiativrik person som henter drivkraft fra samhandling med andre. Du liker å være synlig og dele ideene dine fortløpende.',
      strengths: [
        'Sterke evner til relasjonsbygging, nettverksbygging og formidling.',
        'Skaper naturlig engasjement, entusiasme og god stemning rundt deg.',
        'Uredd for å ta ordet, lede prosesser eller representere bedriften utad.'
      ],
      pitfalls: [
        'Kan ta for mye plass i diskusjoner, slik at mer introverte kolleger blir passive.',
        'Kan bli fort rastløs eller uinspirert av ensomt detaljarbeid og lange rutineoppgaver.',
        'Kan ha en tendens til å tenke høyt og handle før ideene er helt modne.'
      ],
      reflectionQuestions: [
        'Hvordan kan du bevisst bruke din sosiale energi til å løfte frem og lytte til kolleger som er mer ettertenksomme og lavmælte?',
        'Hvordan sikrer du at du beholder fokus og motivasjon når du må jobbe alene over lengre perioder?'
      ],
      interviewQuestions: [
        'Noen oppgaver i denne jobben krever uforstyrret konsentrasjon over lengre tid uten mye sosial kontakt. Hvordan vil du takle det?',
        'Hvordan går du frem for å sikre at alle i et møte slipper til med sine synspunkter, ikke bare de mest taletrengte?'
      ],
      prompts: [
        'Tenk på en gang du bevisst holdt igjen i et møte og stilte et åpent spørsmål til en stille kollega, noe som ledet til en kjempegod løsning.',
        'Reflekter over hvordan du kan kanalisere din entusiasme på en strukturert måte.'
      ],
      honestAnswers: [
        'Jeg får masse energi av å samarbeide, sparre og bygge nettverk. Jeg trives godt med å være i dialog med mange ulike mennesker. Samtidig er jeg veldig bevisst på at min utadvendte stil ikke må overskygge andre, så jeg øver meg aktivt på å stille spørsmål og lytte tålmodig til kolleger som trenger mer tenketid.',
        'Jeg drives av fremdrift og engasjement, og jeg liker å tenke høyt sammen med teamet. Siden jeg vet at dypkonsentrasjon også kreves, pleier jeg å planlegge faste tidsrom i kalenderen der jeg skrur av varsler og jobber målrettet på egen hånd.'
      ]
    }
  },
  omgjengelighet: {
    Lav: {
      interpretation: 'Du er en direkte, uavhengig og resultat- eller konkurranseorientert person. Du setter saklige resultater foran harmonisering, og er ikke redd for saklig uenighet.',
      strengths: [
        'Sterk evne til å ta upopulære beslutninger basert på saklige kriterier.',
        'Skiller skarpt mellom sak og person i diskusjoner.',
        'Tør å utfordre etablerte sannheter og påpeke svakheter som andre tier om for å bevare freden.'
      ],
      pitfalls: [
        'Kan oppfattes som krass, lite empatisk eller samarbeidsvillig av mer relasjonsorienterte kolleger.',
        'Kan skape unødvendige gnisninger i teamet på grunn av en veldig direkte kommunikasjonsstil.',
        'Kan undervurdere betydningen av den sosiale dynamikken for å få med seg folk på endringer.'
      ],
      reflectionQuestions: [
        'Hvordan kan du formulere dine kritiske innspill på en måte som gjør at kollegene dine føler seg respektert og ikke personlig angrepet?',
        'I hvilke situasjoner er det lurt å prioritere det sosiale forholdet fremfor den raskeste faglige konklusjonen?'
      ],
      interviewQuestions: [
        'I denne rollen vil du jobbe i team med svært ulike personligheter. Hvordan håndterer du situasjoner der du mener andres innspill er faglige svake eller urealistiske?',
        'Kan du fortelle om en gang du måtte gi en tøff, men nødvendig tilbakemelding til en kollega, og hvordan du formulerte den?'
      ],
      prompts: [
        'Reflekter over en situasjon der din direkte stil avdekket en kritisk feil og sparte bedriften for store problemer.',
        'Tenk på en kollega du samarbeidet godt med, til tross for at dere var faglig uenige. Hva gjorde at det fungerte?'
      ],
      honestAnswers: [
        'Jeg er opptatt av saklige resultater og høy kvalitet, og jeg er ikke redd for å ta opp vanskelige temaer direkte hvis jeg ser at et prosjekt er på feil spor. Samtidig har jeg lært at formen på tilbakemeldingen er avgjørende for at budskapet skal bli mottatt konstruktivt, så jeg jobber bevisst med å uttrykke meg med respekt og lytte til andres argumenter.',
        'I diskusjoner skiller jeg alltid mellom sak og person. Jeg ser på sunn, faglig uenighet som en drivkraft for bedre løsninger, ikke som en konflikt. For å unngå misforståelser på grunn av min direkte stil, pleier jeg å være tydelig på at mitt mål alltid er prosjektets beste, ikke å vinne diskusjonen.'
      ]
    },
    Moderat: {
      interpretation: 'Du er en god samarbeidspartner som verdsetter et godt arbeidsmiljø, men du evner også å si fra og sette grenser når det er nødvendig for sakens skyld.',
      strengths: [
        'Sunn og pragmatisk balanse mellom relasjonshensyn og saklige krav.',
        'Bidrar aktivt til et hyggelig og tillitsfullt arbeidsmiljø.',
        'Er ikke så konfliktsky at du lar dårlige løsninger passere for å unngå diskusjoner.'
      ],
      pitfalls: [
        'Kan i fastlåste samarbeidskonflikter oppleve et slitsomt indre press mellom å ville glede andre og å måtte stå på dine faglige krav.',
        'Kan av og til utsette å ta opp ubehagelige personlige gnisninger i håp om at det går over av seg selv.'
      ],
      reflectionQuestions: [
        'Når opplever du det som mest utfordrende å si nei til en kollega som ber om hjelp eller innspill?',
        'Hvordan skiller du mellom konflikter som må tas tak i med en gang, og de som kan ligge?'
      ],
      interviewQuestions: [
        'Kan du beskrive en situasjon der du var grunnleggende uenig med teamet ditt, og hvordan du valgte å fremme ditt synspunkt på en konstruktiv måte?',
        'Hvordan reagerer du hvis en kollega opptrer lite samarbeidsvillig overfor deg?'
      ],
      prompts: [
        'Tenk på en gang du hjalp en kollega og opplevde at det styrket deres faglige relasjon på lang sikt.',
        'Reflekter over hvordan du pleier å megle eller bidra til kompromisser i diskusjoner.'
      ],
      honestAnswers: [
        'Jeg strekker meg gjerne langt for å støtte kollegene mine og skape en god lagånd, for jeg tror folk yter best når de føler seg trygge og verdsatt. Samtidig viker jeg ikke unna hvis jeg ser at faglige standarder ikke holdes – da tar jeg det opp på en saklig og ordentlig måte.',
        'Jeg trives best med samarbeid og søker gjerne kompromisser der det er mulig. Hvis en uenighet blir fastlåst, prøver jeg å ta samtalen ansikt til ansikt for å forstå den andres perspektiv og finne en felles plattform vi begge kan stå inne for.'
      ]
    },
    Høy: {
      interpretation: 'Du er svært empatisk, samarbeidsvillig og opptatt av harmoni på arbeidsplassen. Du strekker deg langt for å hjelpe andre og unngå personlige konflikter.',
      strengths: [
        'Fremragende lagspiller som skaper sterk tillit, trivsel og samhold i teamet.',
        'Svært flink til å lytte, vise empati og inkludere ulike stemmer og synspunkter.',
        'Sterk evne til å finne vinn-vinn-løsninger og dempe gnisninger på arbeidsplassen.'
      ],
      pitfalls: [
        'Kan ha store utfordringer med å sette grenser og si nei, noe som kan føre til overbelastning.',
        'Tendens til å unngå nødvendige konfrontasjoner eller utsette upopulære tilbakemeldinger.',
        'Kan svelge for mange kameler eller godta dårlige faglige kompromisser bare for å bevare den gode stemningen.'
      ],
      reflectionQuestions: [
        'Hvordan kan du best sette grenser for din egen kapasitet uten å føle at du skuffer kollegene dine?',
        'Hvordan kan du trene på å gi ærlige, kritiske tilbakemeldinger som styrker kvaliteten, selv om det skaper et øyeblikks ubehag?'
      ],
      interviewQuestions: [
        'Noen ganger må man i denne jobben ta beslutninger eller gi tilbakemeldinger som gjør andre skuffet eller sinte. Hvordan håndterer du slike situasjoner?',
        'Kan du fortelle om en situasjon der du måtte si tydelig nei til en kollega eller kunde for å ivareta kvaliteten eller din egen tidsbruk?'
      ],
      prompts: [
        'Tenk på en gang du ga en konstruktiv, men ærlig tilbakemelding som kollegaen din faktisk takket deg for i ettertid.',
        'Reflekter over forskjellen på "snillisme" og ekte, støttende profesjonalitet.'
      ],
      honestAnswers: [
        'Jeg brenner for å skape et trygt og inkluderende arbeidsmiljø der alle drar i samme retning, og jeg hjelper gjerne kolleger som har det travelt. Jeg har imidlertid måttet øve meg på å sette grenser for min egen kapasitet. Jeg har lært at et vennlig, men tydelig "nei" er nødvendig for at jeg skal kunne levere mitt eget arbeid med topp kvalitet.',
        'Jeg er naturlig opptatt av harmoni, men jeg vet at konfliktskyhet kan skade et prosjekt på sikt. Hvis jeg ser faglige mangler, tvinger jeg meg selv til å ta det opp. Jeg gjør det ved å fokusere strengt på saklige forbedringer, og jeg inviterer alltid den andre til å bidra til løsningen slik at vi bevarer den gode relasjonen.'
      ]
    }
  },
  aapenhet: {
    Lav: {
      interpretation: 'Du er en praktisk, konkret og jordnær person. Du foretrekker velprøvde løsninger fremfor teoretisk eksperimentering, og liker best å jobbe med kjente, definerte oppgaver.',
      strengths: [
        'Sterk praktisk og operasjonell sans; du vet hva som fungerer i det daglige arbeidet.',
        'Høyt fokus på effektiv drift her-og-nå uten å kaste bort tid på urealistiske visjoner.',
        'Utmerket til å perfeksjonere, vedlikeholde og sikre kontinuitet i eksisterende prosesser.'
      ],
      pitfalls: [
        'Kan være skeptisk til nødvendige endringer eller nye måter å løse oppgaver på.',
        'Kan vegre deg for å ta i bruk nye digitale systemer eller verktøy.',
        'Kan kjede deg eller miste tålmodigheten i møter som preges av veldig abstrakte eller strategiske teorier.'
      ],
      reflectionQuestions: [
        'Hvordan kan du best demonstrere for en arbeidsgiver at du er åpen for å lære nye verktøy som er kritiske for rollen, selv om du foretrekker det velkjente?',
        'I hvilke situasjoner på jobb har en mer konservativ tilnærming reddet bedriften fra en umoden og dyr feilinvestering?'
      ],
      interviewQuestions: [
        'Vi endrer ofte på systemer og arbeidsmetoder her hos oss. Kan du fortelle om en gang du måtte lære deg en helt ny arbeidsmetode, og hvordan du opplevde det?',
        'Hvordan forholder du deg til langsiktige strategier som ikke har en umiddelbar, praktisk verdi for dine daglige oppgaver?'
      ],
      prompts: [
        'Tenk på en teknologisk endring eller ny rutine som du først var skeptisk til, men som viste seg å være svært nyttig da du fikk testet den i praksis.',
        'Reflekter over din styrke som den som sikrer at visjonære ideer faktisk lar seg gjennomføre i virkelighetens verden.'
      ],
      honestAnswers: [
        'Jeg er en pragmatisk person som liker at ting fungerer i praksis. Jeg foretrekker velprøvde metoder som beviselig gir resultater, fremfor å eksperimentere bare for eksperimenteringens skyld. Men når nye verktøy eller endringer beviser sin verdi, er jeg opptatt av å lære meg dem grundig for å bruke dem mest mulig effektivt.',
        'Min styrke ligger i den praktiske gjennomføringen. Mens andre gjerne liker å idemyldre fritt, fokuserer jeg på hvordan vi faktisk skal sette ideene ut i live på en realistisk måte innenfor de rammene og ressursene vi har til rådighet.'
      ]
    },
    Moderat: {
      interpretation: 'Du har en god balanse mellom kreativ nysgjerrighet og praktisk realisme. Du er åpen for nye ideer og endringer, men krever at de har en tydelig, beviselig nytteverdi.',
      strengths: [
        'Balansert og realistisk tilnærming til innovasjon og endringsprosesser.',
        'Kan tenke kreativt når situasjonen krever det, uten å miste bakkekontakten eller de operasjonelle realitetene.',
        'Læringsvillig, men beholder et sunt og kritisk blikk på nye trender.'
      ],
      pitfalls: [
        'Kan under hardt krysspress ende opp med å forsvare trygge, foreldede løsninger for lenge.',
        'Kan ha en tendens til å avvise komplekse teorier hvis de ikke umiddelbart oversettes til konkrete eksempler.'
      ],
      reflectionQuestions: [
        'Hvordan vurderer du om en ny idé eller arbeidsmetode er verdt å teste ut i din egen hverdag?',
        'Hva skal til for at du føler deg trygg og motivert i en stor endringsprosess på jobb?'
      ],
      interviewQuestions: [
        'Hvordan går du frem når du skal vurdere om en ny arbeidsmetode er bedre enn den gamle og etablerte?',
        'Kan du gi et eksempel på en gang du tok initiativ til å lære deg noe helt nytt for å løse en oppgave bedre?'
      ],
      prompts: [
        'Identifiser et prosjekt der du kombinerte en ny og spennende idé med en solid, tradisjonell gjennomføringsplan.',
        'Reflekter over din egen evne til å omstille deg når nye teknologiske verktøy introduseres.'
      ],
      honestAnswers: [
        'Jeg er nysgjerrig og lærer gjerne nye verktøy og metoder som kan gjøre arbeidet mitt mer effektivt. Samtidig er jeg opptatt av at vi ikke forkaster velfungerende rutiner uten at vi er trygge på at det nye faktisk fungerer bedre og sparer oss for tid.',
        'Jeg liker å ha en fot i begge leire. Jeg setter pris på strategiske diskusjoner og nye konsepter, men jeg stiller alltid spørsmålet: "Hvordan vil dette hjelpe oss i praksis?" Dette gjør at jeg kan være en god brobygger mellom visjonene og hverdagsdriften.'
      ]
    },
    Høy: {
      interpretation: 'Du er svært nysgjerrig, kreativ og intellektuelt søkende. Du trives best med komplekse konsepter, strategisk tenkning, og kontinuerlig læring og innovasjon.',
      strengths: [
        'Fremragende evne til nytekning, innovasjon og å se alternative løsninger på gamle problemer.',
        'Trives godt i uoversiktlige situasjoner og endringsprosesser med uklare rammer.',
        'Tilegner deg ny, komplisert fagkunnskap og teknologisk kompetanse svært raskt.'
      ],
      pitfalls: [
        'Kan miste interessen eller motivasjonen for rutineoppgaver og daglig drift når den første nyhetens interesse har lagt seg.',
        'Kan bli for teoretisk eller abstrakt i din kommunikasjon, noe som kan frustrere mer praktiske kolleger.',
        'Fare for å foreslå unødvendig komplekse eller eksperimentelle løsninger på enkle, operative utfordringer.'
      ],
      reflectionQuestions: [
        'Hvordan kan du best sikre at dine kreative ideer blir forankret i de praktiske rammene og ressursene som faktisk er tilgjengelige på arbeidsplassen?',
        'Hvordan kan du kommunisere dine visjoner på en jordnær og konkret måte som skaper trygghet hos skeptiske kolleger?'
      ],
      interviewQuestions: [
        'Du har mange spennende og kreative ideer, men noen ganger må vi levere på enkle rutineoppgaver uten å finne opp hjulet på nytt. Hvordan trives du med det i lengden?',
        'Kan du fortelle om en gang du tok et helt utradisjonelt konsept og klarte å gjøre det forståelig og verdifullt for bedriften din?'
      ],
      prompts: [
        'Tenk på en gang din evne til å tenke utenfor boksen løste en fastlåst situasjon som ingen andre fant ut av.',
        'Reflekter over hvordan du kan strukturere din nysgjerrighet slik at den støtter opp under bedriftens faktiske kjernevirksomhet.'
      ],
      honestAnswers: [
        'Jeg blir sterkt motivert av kontinuerlig forbedring, nysgjerrighet og strategiske utfordringer. Jeg elsker å lære nye ting og tenke kreativt. Samtidig har jeg stor forståelse for at rutiner og drift er ryggraden i enhver virksomhet, så jeg jobber målrettet med å forankre mine ideer i praktiske og målbare planer.',
        'Jeg ser fort mønstre og muligheter for forbedring som andre kanskje ikke oppdager så lett. For å sikre at jeg ikke løper for raskt av gårde med nye ideer, pleier jeg å sparre tidlig med mer praktisk orienterte kolleger. Det gir ideene mine den nødvendige bakkekontakten.'
      ]
    }
  }
};

// ---------------------------------------------------------------------------
// Scoring helpers (single source of truth — previously duplicated across
// Results, ConsistencyReview, InterviewSimulator, JobAnalysis, App, pdfExport).
// ---------------------------------------------------------------------------

export type Band = 'Lav' | 'Moderat' | 'Høy';

/** Effective (forward-scored) value of one answer, reversing negatively keyed items.
 *  Missing answers fall back to neutral (3). Likert values are 1–5. */
export function effectiveAnswer(statement: Statement, rawAnswer: number | undefined): number {
  const ans = rawAnswer ?? 3;
  return statement.keyed === 'negativ' ? 6 - ans : ans;
}

/** Mean dimension score (1–5), unrounded. */
export function computeDimensionScore(
  dim: DimensionKey,
  answers: Record<string, number>
): number {
  const dimStatements = statements.filter((s) => s.dimensjon === dim);
  const sum = dimStatements.reduce((acc, s) => acc + effectiveAnswer(s, answers[s.id]), 0);
  return sum / dimStatements.length;
}

/** Map a dimension score to its band. Lav ≤ 2.6, Høy ≥ 3.7, else Moderat. */
export function getBand(score: number): Band {
  if (score <= 2.6) return 'Lav';
  if (score >= 3.7) return 'Høy';
  return 'Moderat';
}

/** Standardize a 1–5 mean score to a POMP score (Percent of Maximum Possible, 0–100).
 *  POMP = (skår − min) / (maks − min) × 100, med min=1 og maks=5 på Likert-skalaen. */
export function toPOMP(score: number): number {
  const pomp = ((score - 1) / 4) * 100;
  return Math.max(0, Math.min(100, Math.round(pomp)));
}

// ---------------------------------------------------------------------------
// Integritetsskala — egen skala (ikke Big Five). Lettvekts info-objekt: vi
// gjenbruker computeDimensionScore('integritet') + getBand + toPOMP for tall,
// og viser en kort, ærlig og ikke-dømmende tolkning per bånd i resultatene.
// ---------------------------------------------------------------------------
export const INTEGRITY_KEY: DimensionKey = 'integritet';

export interface IntegrityBandContent {
  interpretation: string;
  prepTip: string;
}

export const integrityInfo: {
  name: string;
  description: string;
  bands: Record<Band, IntegrityBandContent>;
} = {
  name: 'Integritet og pålitelighet',
  description:
    'En egen skala som mange rekrutteringstester (særlig innen politi, forsvar og finans) kombinerer med personlighetsprofilen. Den handler om pålitelighet, holdning til regler og risiko, og etisk dømmekraft — ikke om du er et «godt» eller «dårlig» menneske.',
  bands: {
    Høy: {
      interpretation:
        'Svarene dine peker mot en sterk vekt på pålitelighet, ærlighet og det å følge felles kjøreregler. Dette er ofte ønsket i roller med tillit, sikkerhet eller verdihåndtering.',
      prepTip:
        'Vær forberedt på å vise, ikke bare hevde, integritet: ha et konkret eksempel klart der du gjorde det riktige selv når det kostet deg noe. Unngå å virke rigid — vis at du også bruker skjønn.',
    },
    Moderat: {
      interpretation:
        'Svarene dine viser en balansert holdning: pålitelig, men pragmatisk. Du veier regler mot situasjon snarere enn å følge dem blindt.',
      prepTip:
        'Forbered en STAR-historie som viser at du tar ansvar og er til å stole på, men også kan bruke sunn dømmekraft når reglene ikke passer situasjonen.',
    },
    Lav: {
      interpretation:
        'Svarene dine peker mot høyere risikovilje og en mer selvstendig holdning til regler. Det kan være en styrke i roller som krever mot og nytenkning, men kan skape spørsmål i tillits- og sikkerhetskritiske stillinger.',
      prepTip:
        'I en ekte test fanges «pynting» lett opp. Vær heller forberedt på å ramme inn risikoviljen din konstruktivt — vis at du forstår når forsiktighet og etterrettelighet er nødvendig, med et konkret eksempel.',
    },
  },
};

// ---------------------------------------------------------------------------
// Illustrative work-style reference profiles.
//
// These are NOT normed occupational personality profiles and must not be
// presented as career advice, suitability assessment, or scientific matching.
// They are used only as a lightweight reflection feature in the results view
// (kun Big Five inngår — ikke integritet, siden dette handler om arbeidsstil,
// ikke pålitelighet).
// ---------------------------------------------------------------------------
export interface RoleProfile {
  id: string;
  name: string;
  blurb: string;
  profile: Record<BigFiveKey, number>;
}

export const roleProfiles: RoleProfile[] = [
  {
    id: 'selger',
    name: 'Selger',
    blurb: 'Trives ofte med kontakt, initiativ og å håndtere både ja og nei i møte med kunder.',
    profile: { planmessighet: 3.5, emosjonell_stabilitet: 3.8, ekstroversjon: 4.4, omgjengelighet: 3.2, aapenhet: 3.0 },
  },
  {
    id: 'prosjektleder',
    name: 'Prosjektleder',
    blurb: 'Liker struktur, fremdrift og koordinering av mennesker, mål og frister.',
    profile: { planmessighet: 4.3, emosjonell_stabilitet: 4.0, ekstroversjon: 3.7, omgjengelighet: 3.6, aapenhet: 3.4 },
  },
  {
    id: 'utvikler',
    name: 'Utvikler / IT',
    blurb: 'Trives med problemløsing, læring og konsentrert arbeid, gjerne kombinert med samarbeid.',
    profile: { planmessighet: 4.0, emosjonell_stabilitet: 3.6, ekstroversjon: 3.0, omgjengelighet: 3.3, aapenhet: 4.2 },
  },
  {
    id: 'sykepleier',
    name: 'Sykepleier',
    blurb: 'Kombinerer ansvarsfølelse, menneskekontakt og evne til å bevare ro i krevende situasjoner.',
    profile: { planmessighet: 4.1, emosjonell_stabilitet: 4.0, ekstroversjon: 3.4, omgjengelighet: 4.3, aapenhet: 3.2 },
  },
  {
    id: 'regnskapsforer',
    name: 'Regnskapsfører',
    blurb: 'Trives med nøyaktighet, oversikt og pålitelige prosesser i arbeid med tall og dokumentasjon.',
    profile: { planmessighet: 4.4, emosjonell_stabilitet: 3.8, ekstroversjon: 2.8, omgjengelighet: 3.4, aapenhet: 3.1 },
  },
  {
    id: 'laerer',
    name: 'Lærer',
    blurb: 'Kombinerer formidling, tålmodighet og struktur med interesse for utvikling og læring.',
    profile: { planmessighet: 4.0, emosjonell_stabilitet: 3.9, ekstroversjon: 3.9, omgjengelighet: 4.1, aapenhet: 3.8 },
  },
  {
    id: 'hr-radgiver',
    name: 'HR-rådgiver',
    blurb: 'Trives med samtaler, diskresjon og vurderinger der både mennesker og regler betyr noe.',
    profile: { planmessighet: 3.9, emosjonell_stabilitet: 4.0, ekstroversjon: 3.6, omgjengelighet: 4.2, aapenhet: 3.6 },
  },
  {
    id: 'kunde-service',
    name: 'Kunde- og servicearbeid',
    blurb: 'Liker å hjelpe, forklare og holde roen i praktisk kontakt med ulike mennesker.',
    profile: { planmessighet: 3.6, emosjonell_stabilitet: 4.0, ekstroversjon: 3.7, omgjengelighet: 4.2, aapenhet: 3.1 },
  },
  {
    id: 'konsulent',
    name: 'Konsulent',
    blurb: 'Liker nye problemstillinger, leveransefokus og å tilpasse seg ulike kunder eller behov.',
    profile: { planmessighet: 4.1, emosjonell_stabilitet: 4.0, ekstroversjon: 4.0, omgjengelighet: 3.6, aapenhet: 4.0 },
  },
];

export interface RankedRoleProfile extends RoleProfile {
  distance: number;
}

/**
 * Sorterer alle referanseprofilene etter euklidsk avstand til brukerens Big
 * Five-skårer og returnerer de `limit` nærmeste. Avstanden er kun til intern
 * sortering — vis den ikke direkte til brukeren (falsk presisjon).
 */
export function findClosestRoles(scores: Record<BigFiveKey, number>, limit = 3): RankedRoleProfile[] {
  return roleProfiles
    .map((role) => {
      const keys = Object.keys(role.profile) as BigFiveKey[];
      const distance = Math.sqrt(keys.reduce((sum, k) => sum + (scores[k] - role.profile[k]) ** 2, 0));
      return { ...role, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
