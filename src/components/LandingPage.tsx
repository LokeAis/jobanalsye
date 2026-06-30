import React from 'react';
import { Compass, BookOpen, ClipboardList, Shield, Award, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onViewOverview: () => void;
  completedCount: number;
}

export default function LandingPage({ onStart, onViewOverview, completedCount }: LandingPageProps) {
  return (
    <div id="landing-page" className="max-w-4xl mx-auto py-6 px-4">
      {/* Hero Section */}
      <div className="text-center md:py-10 py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-semibold mb-4">
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          Rekrutteringstentamen &amp; Generalprøve
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">
          Big Five Rekrutteringstentamen
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
          Skal du gjennomgå en personlighetskartlegging (MAP, OPQ32, cut-e) til en jobb? 
          Dette er din realistiske generalprøve for å trene på å svare raskt, ærlig og konsistent under press.
        </p>

        {/* Clear, visible disclaimer */}
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-xs sm:text-sm text-amber-900 leading-relaxed max-w-2xl mx-auto text-left mb-8">
          <span className="font-bold text-amber-950 block mb-1">⚠️ Viktig øvingsformål:</span>
          Dette er et øvingsverktøy for selvinnsikt og forberedelse, ikke en offisiell test. Hensikten er ærlig forberedelse under press, ikke å manipulere resultatet. Profesjonelle tester fanger enkelt opp forsøk på å pynte på sannheten.
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            id="btn-start-prep"
            onClick={onStart}
            className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md cursor-pointer text-sm sm:text-base"
          >
            {completedCount > 0 ? (
              completedCount === 60 ? 'Se din tentamensrapport (debrief)' : 'Fortsett generalprøven'
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
            Få en nøytral og realistisk innføring i de fem personlighetsdimensjonene. Lær nøyaktig hva høye og lave skårer betyr i arbeidskontekst.
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-700 mb-4">
            <ClipboardList className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base mb-2">2. Presstrening under tid</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Svar på 60 jobbrelaterte påstander. Velg "Realistisk modus" for å overvinne overtenking ved hjelp av tidsindikator per påstand.
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-xs">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-700 mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-slate-900 text-base mb-2">3. Omfattende Debrief</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Avdekk sprik mellom selvbilde og faktiske svar, identifiser konsistens-avvik, og motta rekruttererens sannsynlige oppfølgingsspørsmål.
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
        <h3 className="font-semibold text-slate-900 text-base mb-3">Hvorfor ta en tentamen før testen?</h3>
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          Målet med en personlighetstest (som f.eks. MAP eller OPQ32) er ikke å få høyest mulig skår på alt. Det finnes ingen fasit, og forskjellige stillinger krever helt ulik atferd.
        </p>
        <p className="text-slate-600 text-sm leading-relaxed">
          I en rekrutteringsprosess er det lett å ville fremstå "perfekt", men dette slår uheldig ut på testenes validitets- og konsistensmålinger. Generalprøven hjelper deg med å bli godt nok kjent med egne tendenser til å svare raskt, ærlig og konsistent under det reelle presset.
        </p>
      </div>
    </div>
  );
}
