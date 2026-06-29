import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div 
      id="disclaimer-banner"
      className="bg-amber-50/90 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg flex items-start gap-3 shadow-xs text-xs sm:text-sm max-w-5xl mx-auto my-4"
    >
      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-amber-950">Viktig informasjon:</span>{' '}
        Dette verktøyet er kun laget for læring og refleksjon. Det er ikke en offisiell MAP-test, ikke tilknyttet Assessio, og skal ikke brukes til å ta ansettelsesbeslutninger. Resultatene er ikke normerte og må ikke tolkes som en fasit.
      </div>
    </div>
  );
}
