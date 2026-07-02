import React, { useState } from 'react';
import { dimensionsData, DimensionKey, statements } from '../data/statements';
import { ChevronDown, ChevronUp, Layers, Activity, Users, Heart, Lightbulb } from 'lucide-react';

export default function BigFiveOverview() {
  const [expandedDimension, setExpandedDimension] = useState<DimensionKey | null>('planmessighet');

  const getDimensionIcon = (key: DimensionKey) => {
    switch (key) {
      case 'planmessighet':
        return <Layers className="w-5 h-5 text-indigo-600" />;
      case 'emosjonell_stabilitet':
        return <Activity className="w-5 h-5 text-emerald-600" />;
      case 'ekstroversjon':
        return <Users className="w-5 h-5 text-sky-600" />;
      case 'omgjengelighet':
        return <Heart className="w-5 h-5 text-rose-600" />;
      case 'aapenhet':
        return <Lightbulb className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getDimensionBadgeStyle = (key: DimensionKey) => {
    switch (key) {
      case 'planmessighet':
        return 'bg-indigo-50 border-indigo-100 text-indigo-800';
      case 'emosjonell_stabilitet':
        return 'bg-emerald-50 border-emerald-100 text-emerald-800';
      case 'ekstroversjon':
        return 'bg-sky-50 border-sky-100 text-sky-800';
      case 'omgjengelighet':
        return 'bg-rose-50 border-rose-100 text-rose-800';
      case 'aapenhet':
        return 'bg-amber-50 border-amber-100 text-amber-800';
    }
  };

  return (
    <div id="big-five-overview" className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-8 text-center md:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          De fem dimensjonene (Big Five)
        </h2>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          Modellen er det mest anerkjente og vitenskapelig dokumenterte verktøyet for å beskrive menneskelig personlighet. 
          Klikk på dimensjonene nedenfor for å se hvordan de påvirker arbeidshverdagen, og hvorfor det ikke finnes noen "riktig" eller "gal" skår.
        </p>
      </div>

      <div className="space-y-4">
        {(Object.keys(dimensionsData) as DimensionKey[]).map((key) => {
          const dim = dimensionsData[key];
          const isExpanded = expandedDimension === key;

          return (
            <div 
              key={key} 
              id={`dim-card-${key}`}
              className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-xs transition duration-200 hover:border-slate-200"
            >
              {/* Header section (Click to toggle) */}
              <button
                onClick={() => setExpandedDimension(isExpanded ? null : key)}
                className="w-full flex items-center justify-between p-5 text-left cursor-pointer focus:outline-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getDimensionBadgeStyle(key)}`}>
                    {getDimensionIcon(key)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-950 text-base sm:text-lg leading-tight">
                      {dim.name}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5 line-clamp-1">
                      {dim.description}
                    </p>
                  </div>
                </div>
                <div className="text-slate-400 shrink-0 ml-4">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 pb-6 border-t border-slate-50 pt-5 space-y-6 text-sm sm:text-base">
                  
                  {/* Detailed Intro */}
                  <div>
                    <h4 className="font-semibold text-slate-900 text-xs tracking-wider uppercase mb-2">
                      Om egenskapen
                    </h4>
                    <p className="text-slate-600 leading-relaxed">
                      {dim.description}
                    </p>
                  </div>

                  {/* High and Low columns */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-100">
                      <div className="inline-block px-2.5 py-0.5 bg-slate-200 text-slate-800 text-xs font-semibold rounded-full mb-2">
                        Høy skår på jobb
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {dim.highDescription}
                      </p>
                    </div>

                    <div className="bg-slate-50/60 p-4 rounded-lg border border-slate-100">
                      <div className="inline-block px-2.5 py-0.5 bg-slate-200 text-slate-800 text-xs font-semibold rounded-full mb-2">
                        Lav skår på jobb
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {dim.lowDescription}
                      </p>
                    </div>
                  </div>

                  {/* No "best" section */}
                  <div className="border-l-4 border-teal-500 bg-teal-50/40 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-teal-950 text-sm mb-1">
                      Hvorfor verken høy eller lav skår er "best":
                    </h4>
                    <p className="text-teal-900 text-sm leading-relaxed">
                      {dim.comparison}
                    </p>
                  </div>

                  {/* Example situation */}
                  <div className="bg-slate-50/40 p-4 rounded-lg border border-slate-100/80">
                    <h4 className="font-semibold text-slate-900 text-sm mb-2">
                      Eksempelsituasjon i arbeidshverdagen:
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed italic">
                      "{dim.example}"
                    </p>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dynamic CTA at the bottom */}
      <div className="mt-10 p-6 bg-slate-50 rounded-xl text-center border border-slate-200/60">
        <h3 className="font-semibold text-slate-900 text-base mb-2">Klar for å reflektere over egne tendenser?</h3>
        <p className="text-slate-600 text-sm mb-4 max-w-xl mx-auto">
          Ved å svare på {statements.length} korte påstander kan du se din egen personlighetsprofil basert på dine svar.
          Husk at målet er ærlig og konsistent selvinnsikt, ikke å svare "perfekt".
        </p>
      </div>
    </div>
  );
}
