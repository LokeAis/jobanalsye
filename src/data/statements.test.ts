import { describe, it, expect } from 'vitest';
import {
  statements,
  effectiveAnswer,
  computeDimensionScore,
  getBand,
  resolveDimensionKey,
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
