import { describe, it, expect } from 'vitest';
import {
  statements,
  effectiveAnswer,
  computeDimensionScore,
  getBand,
  resolveDimensionKey,
  toPOMP,
  INTEGRITY_KEY,
  integrityInfo,
  type DimensionKey,
} from './statements';

const DIMS: DimensionKey[] = [
  'planmessighet',
  'emosjonell_stabilitet',
  'ekstroversjon',
  'omgjengelighet',
  'aapenhet',
];

describe('getBand', () => {
  it('respekterer grensene (Lav ≤2.6, Høy ≥3.7)', () => {
    expect(getBand(1)).toBe('Lav');
    expect(getBand(2.6)).toBe('Lav');
    expect(getBand(2.61)).toBe('Moderat');
    expect(getBand(3.0)).toBe('Moderat');
    expect(getBand(3.69)).toBe('Moderat');
    expect(getBand(3.7)).toBe('Høy');
    expect(getBand(5)).toBe('Høy');
  });
});

describe('effectiveAnswer', () => {
  const pos = statements.find((s) => s.keyed === 'positiv')!;
  const neg = statements.find((s) => s.keyed === 'negativ')!;

  it('beholder verdien for positivt kodede ledd', () => {
    expect(effectiveAnswer(pos, 4)).toBe(4);
  });
  it('reverserer negativt kodede ledd (6 - svar)', () => {
    expect(effectiveAnswer(neg, 4)).toBe(2);
    expect(effectiveAnswer(neg, 1)).toBe(5);
  });
  it('faller tilbake til nøytral (3) ved manglende svar', () => {
    expect(effectiveAnswer(pos, undefined)).toBe(3);
    expect(effectiveAnswer(neg, undefined)).toBe(3);
  });
});

describe('computeDimensionScore', () => {
  it('gir 3.0 for alle dimensjoner uten svar', () => {
    for (const d of DIMS) {
      expect(computeDimensionScore(d, {})).toBeCloseTo(3.0);
    }
  });

  it('gir 5.0 / 1.0 ved maks / min effektiv verdi (reverskoding ende-til-ende)', () => {
    const high: Record<string, number> = {};
    const low: Record<string, number> = {};
    for (const s of statements) {
      high[s.id] = s.keyed === 'negativ' ? 1 : 5;
      low[s.id] = s.keyed === 'negativ' ? 5 : 1;
    }
    for (const d of DIMS) {
      expect(computeDimensionScore(d, high)).toBeCloseTo(5.0);
      expect(computeDimensionScore(d, low)).toBeCloseTo(1.0);
    }
  });
});

describe('toPOMP', () => {
  it('mapper 1–5 til 0–100 lineært', () => {
    expect(toPOMP(1)).toBe(0);
    expect(toPOMP(3)).toBe(50);
    expect(toPOMP(5)).toBe(100);
    expect(toPOMP(2)).toBe(25);
    expect(toPOMP(4)).toBe(75);
  });
  it('klamrer utenfor 0–100', () => {
    expect(toPOMP(0)).toBe(0);
    expect(toPOMP(6)).toBe(100);
  });
});

describe('integritetsskala', () => {
  const integrityStatements = statements.filter((s) => s.dimensjon === 'integritet');

  it('har egne påstander som ikke lekker inn i Big Five', () => {
    expect(integrityStatements.length).toBeGreaterThanOrEqual(10);
    // Ingen av de 5 Big Five-dimensjonene inneholder integritetsledd.
    for (const d of DIMS) {
      expect(statements.filter((s) => s.dimensjon === d).every((s) => s.dimensjon !== 'integritet')).toBe(true);
    }
  });

  it('computeDimensionScore(integritet) gir 5.0 / 1.0 ved maks / min (reverskoding)', () => {
    const high: Record<string, number> = {};
    const low: Record<string, number> = {};
    for (const s of integrityStatements) {
      high[s.id] = s.keyed === 'negativ' ? 1 : 5;
      low[s.id] = s.keyed === 'negativ' ? 5 : 1;
    }
    expect(computeDimensionScore(INTEGRITY_KEY, high)).toBeCloseTo(5.0);
    expect(computeDimensionScore(INTEGRITY_KEY, low)).toBeCloseTo(1.0);
  });

  it('integrityInfo har tolkning + tips for alle bånd', () => {
    for (const band of ['Lav', 'Moderat', 'Høy'] as const) {
      expect(integrityInfo.bands[band].interpretation.length).toBeGreaterThan(0);
      expect(integrityInfo.bands[band].prepTip.length).toBeGreaterThan(0);
    }
  });
});

describe('resolveDimensionKey', () => {
  it('matcher ASCII-nøkler og norske navn/varianter', () => {
    expect(resolveDimensionKey('planmessighet')).toBe('planmessighet');
    expect(resolveDimensionKey('Planmessighet')).toBe('planmessighet');
    expect(resolveDimensionKey('åpenhet')).toBe('aapenhet');
    expect(resolveDimensionKey('Åpenhet for erfaring')).toBe('aapenhet');
    expect(resolveDimensionKey('emosjonell stabilitet')).toBe('emosjonell_stabilitet');
    expect(resolveDimensionKey('Omgjengelighet')).toBe('omgjengelighet');
  });

  it('returnerer undefined for ukjent/tomt', () => {
    expect(resolveDimensionKey('tøv')).toBeUndefined();
    expect(resolveDimensionKey('')).toBeUndefined();
  });
});
