import { describe, it, expect } from "vitest";
import {
  safeEqual,
  signSession,
  verifySession,
  CREDIT_PACKAGES,
} from "./server-utils";

const TEST_SECRET = "test-secret-for-vitest-only";

// --- safeEqual ---
describe("safeEqual", () => {
  it("returnerer true for identiske strenger", () => {
    expect(safeEqual("abc123", "abc123")).toBe(true);
  });

  it("returnerer false for ulike strenger med lik lengde", () => {
    expect(safeEqual("abc123", "abc124")).toBe(false);
  });

  it("returnerer false for ulik lengde", () => {
    expect(safeEqual("short", "muchlonger")).toBe(false);
  });

  it("returnerer true for tomme strenger", () => {
    expect(safeEqual("", "")).toBe(true);
  });

  it("returnerer false for tom vs ikke-tom", () => {
    expect(safeEqual("", "x")).toBe(false);
  });
});

// --- signSession / verifySession ---
describe("signSession + verifySession", () => {
  const payload = { uid: "user123", turnsLeft: 10, iat: Date.now() };

  it("rund-tur: sign → verify returnerer opprinnelig payload", () => {
    const token = signSession(TEST_SECRET, payload);
    const result = verifySession(TEST_SECRET, token);
    expect(result).toEqual(payload);
  });

  it("forkaster token signert med annen secret", () => {
    const token = signSession(TEST_SECRET, payload);
    expect(verifySession("wrong-secret", token)).toBeNull();
  });

  it("forkaster manipulert payload (endret turnsLeft)", () => {
    const token = signSession(TEST_SECRET, payload);
    const [body] = token.split(".");
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString());
    decoded.turnsLeft = 999;
    const tampered =
      Buffer.from(JSON.stringify(decoded)).toString("base64url") +
      "." +
      token.split(".")[1];
    expect(verifySession(TEST_SECRET, tampered)).toBeNull();
  });

  it("forkaster ikke-streng input", () => {
    expect(verifySession(TEST_SECRET, null)).toBeNull();
    expect(verifySession(TEST_SECRET, undefined)).toBeNull();
    expect(verifySession(TEST_SECRET, 42)).toBeNull();
    expect(verifySession(TEST_SECRET, {})).toBeNull();
  });

  it("forkaster streng uten punktum", () => {
    expect(verifySession(TEST_SECRET, "nodothere")).toBeNull();
  });

  it("forkaster ugyldig base64-body", () => {
    expect(verifySession(TEST_SECRET, "!!!.???")).toBeNull();
  });

  it("bevarer alle payload-felter nøyaktig", () => {
    const p = { uid: "æøå-bruker", turnsLeft: 0, iat: 1719820800000 };
    const token = signSession(TEST_SECRET, p);
    expect(verifySession(TEST_SECRET, token)).toEqual(p);
  });
});

// --- CREDIT_PACKAGES ---
describe("CREDIT_PACKAGES", () => {
  it("har unike id-er", () => {
    const ids = CREDIT_PACKAGES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("alle pakker har positiv pris og positive klipp", () => {
    for (const pkg of CREDIT_PACKAGES) {
      expect(pkg.credits).toBeGreaterThan(0);
      expect(pkg.amountNok).toBeGreaterThan(0);
    }
  });

  it("pris per klipp synker med pakke-størrelse (kvantumrabatt)", () => {
    const perCredit = CREDIT_PACKAGES.map((p) => p.amountNok / p.credits);
    for (let i = 1; i < perCredit.length; i++) {
      expect(perCredit[i]).toBeLessThan(perCredit[i - 1]);
    }
  });

  it("alle har en label", () => {
    for (const pkg of CREDIT_PACKAGES) {
      expect(pkg.label.length).toBeGreaterThan(0);
    }
  });
});
