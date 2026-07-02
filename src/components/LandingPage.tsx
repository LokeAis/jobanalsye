import React, { useState } from 'react';
import { Compass, BookOpen, ClipboardList, Shield, Award, ArrowRight, Ticket, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import CreditPurchase from './CreditPurchase';
import { statements } from '../data/statements';

interface LandingPageProps {
  onStart: () => void;
  onViewOverview: () => void;
  completedCount: number;
}

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Er dette en offisiell test?',
    a: 'Nei. Dette er et uavhengig øvings- og refleksjonsverktøy, ikke en offisiell test. Det bruker ikke faktiske testledd fra MAP, OPQ, Aon/cut-e eller andre proprietære tester, og er ikke tilknyttet Assessio, SHL, Aon eller andre testleverandører.',
  },
  {
    q: 'Er det samme som MAP, OPQ eller Aon/cut-e?',
    a: 'Nei, men prinsippet er beslektet. De fleste av disse testene bygger på Big Five-modellen (femfaktormodellen) som denne generalprøven også bruker. Selve påstandene og skåringsmodellen her er egenutviklet, ikke kopiert fra noen leverandør.',
  },
  {
    q: 'Kan jeg øve helt gratis?',
    a: 'Ja. Selve generalprøven, personlighetsprofilen og notatene er gratis og lagres kun lokalt i nettleseren din. Kun de valgfrie AI-funksjonene (jobbanalyse og øvingsintervju) bruker «klipp», og nye brukere får ett klipp gratis.',
  },
  {
    q: 'Finnes det riktige eller gale svar?',
    a: 'Nei. Personlighetstester er normative (skårer hver dimensjon uavhengig og sammenligner mot en gruppe) eller ipsative (tvinger deg til å prioritere mellom påstander). Denne generalprøven bruker en normativ Likert-skala. Målet er ikke å «vinne», men å svare raskt, ærlig og konsistent — inkonsekvente svar fanges lett opp i ekte tester.',
  },
  {
    q: 'Hva måler integritetsskalaen?',
    a: 'En egen skala (adskilt fra Big Five) som mange rekrutteringstester innen politi, forsvar og finans bruker ved siden av personlighetsprofilen. Den ser på pålitelighet, holdning til regler/risiko og etisk dømmekraft — ikke om du er et «godt» eller «dårlig» menneske.',
  },
  {
    q: 'Lagres svarene mine noe sted?',
    a: 'Test, profil og notater lagres kun lokalt i nettleseren din. Den valgfrie AI-jobbanalysen og øvingsintervjuet sender stillingsinfo og dine Big Five-skårer til Google Gemini for å generere rapporten — dette skjer kun når du aktivt samtykker til det.',
  },
];

export default function LandingPage({ onStart, onViewOverview, completedCount }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div id="landing-page" className="max-w-4xl mx-auto py-6 px-4">
      {/* Hero Section */}
      <div className="text-center md:py-10 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-semibold mb-4">
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          Forberedelse &amp; generalprøve
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Big Five Forberedelse – din generalprøve før personlighetstesten
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4">
          Skal du ta en personlighetstest i en rekrutteringsprosess? Dette er en realistisk øving
          basert på Big Five-logikk, laget for deg som vil bli tryggere før tester som MAP, OPQ eller
          Aon/cut-e. Du får trene på jobbrelaterte påstander, se din egen profil og forstå hvordan
          svarene dine kan tolkes i en arbeidssammenheng.
        </p>
        <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed mb-6">
          Test, profil og notater er gratis og lagres kun lokalt i nettleseren din. De valgfrie
          AI-funksjonene – en jobbanalyse mot en konkret stilling og et øvingsintervju med skreddersydde
          spørsmål – bruker «klipp».
        </p>

        {/* Clear, visible disclaimer */}
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-xs sm:text-sm text-amber-900 leading-relaxed max-w-2xl mx-auto text-left mb-8">
          <span className="font-bold text-amber-950 block mb-1">⚠️ Viktig øvingsformål:</span>
          Dette er et uavhengig øvingsverktøy for selvinnsikt og forberedelse, ikke en offisiell test. Hensikten er ærlig forberedelse, ikke å manipulere resultatet — profesjonelle tester fanger enkelt opp forsøk på å pynte på sannheten. Verktøyet bruker ikke faktiske testledd fra MAP, OPQ, Aon/cut-e eller andre proprietære tester, og er ikke tilknyttet Assessio, SHL, Aon eller andre testleverandører.
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            id="btn-start-prep"
            onClick={onStart}
            className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
          >
            {completedCount > 0 ? (
              completedCount === statements.length ? 'Se din debrief-rapport' : 'Fortsett generalprøven'
            ) : (
              'Start din generalprøve'
            )}
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            id="btn-view-theory"
            onClick={onViewOverview}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-6 py-3 rounded-lg transition cursor-pointer text-sm sm:text-base"
          >
            Les om de fem dimensjonene
          </button>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-teal-700 mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base mb-2">1. Forstå spillereglene</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Få en nøytral innføring i de fem personlighetsdimensjonene. Se hva høye og lave skårer ofte kan bety i en arbeidssammenheng — uten at én profil er «riktig» for alle jobber.
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-700 mb-4">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base mb-2">2. Tren på å svare under tidspress</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Svar på {statements.length} jobbrelaterte påstander, inkludert en egen integritetsskala. Velg «Realistisk modus», der en tidsindikator per påstand hjelper deg å redusere overtenking.
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-700 mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base mb-2">3. Få en grundig debrief</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Se mønstre og mulige konsistensavvik mellom hvordan du ser deg selv og svarene dine, og hvilke oppfølgingsspørsmål en rekrutterer kan stille. Målet er ikke fasit, men bedre selvinnsikt før intervjuet.
          </p>
        </div>
      </div>

      {/* Privacy & Methodology Card */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-6 mt-10">
        <div className="flex items-start gap-4">
          <Shield className="w-6 h-6 text-slate-500 shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-slate-900 text-sm mb-1">Test og notater er 100 % lokale</h4>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Alle svar, gjetninger, valgt modus og personlige notater lagres kun lokalt i din egen nettlesers minne (localStorage), og kan slettes permanent når som helst. Den valgfrie AI-jobbanalysen sender stillingsinfo og dine Big Five-skårer til Google Gemini for å generere rapporten — resten av appen fungerer uten den.
            </p>
          </div>
        </div>
      </div>

      {/* Helpful tips card */}
      <div className="bg-white border border-slate-100 rounded-xl p-6 mt-6">
        <h3 className="font-semibold text-slate-900 text-base mb-3">Hvorfor ta en generalprøve før testen?</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          Målet med en personlighetstest (som f.eks. MAP eller OPQ32) er ikke å få høyest mulig skår på alt. Det finnes ingen fasit, og forskjellige stillinger krever helt ulik atferd.
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          I en rekrutteringsprosess er det lett å ville fremstå «perfekt», men det gjør svarene dine mindre konsistente – og det fanger testen opp. Generalprøven hjelper deg med å bli godt nok kjent med egne tendenser til å svare raskt, ærlig og konsistent under det reelle presset.
        </p>
      </div>

      {/* FAQ */}
      <div id="faq" className="mt-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-800 text-xs font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            Ofte stilte spørsmål
          </div>
        </div>
        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-slate-900 text-sm sm:text-base">{item.q}</span>
                  <span className="text-slate-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-3">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing */}
      <div id="priser" className="mt-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-semibold mb-3">
            <Ticket className="w-3.5 h-3.5 text-amber-600" />
            Priser
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Test gratis – betal kun for AI</h2>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            Selve generalprøven, profilen og notatene er gratis. AI-jobbanalysen og
            øvingsintervjuet bruker «klipp»: <strong>1 klipp = én AI-jobbanalyse eller
            ett øvingsintervju</strong>. Nye brukere får ett klipp gratis.
          </p>
        </div>
        <CreditPurchase />
      </div>
    </div>
  );
}
