import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEIGHTS,
  computeScore,
  rankAll,
  rankDelta,
  rawScore,
  reactionWeight,
  timeDecay,
} from "./score";

const NOW = new Date("2026-08-28T00:00:00.000Z");

const emptyInput = {
  like_count: 0,
  comment_count: 0,
  share_count: 0,
  save_count: 0,
  view_complete: 0,
  view_half: 0,
  published_at: null,
};

describe("rawScore", () => {
  it("applies the spec weights", () => {
    const raw = rawScore(
      {
        ...emptyInput,
        share_count: 2, // ·10 = 20
        save_count: 3, // ·6  = 18
        like_count: 4, // ·3  = 12
        comment_count: 1, // ·4  = 4
        view_complete: 5, // ·2  = 10
        view_half: 6, // ·0.5 = 3
      },
      DEFAULT_WEIGHTS,
    );
    expect(raw).toBe(67);
  });

  it("is zero for no reactions", () => {
    expect(rawScore(emptyInput, DEFAULT_WEIGHTS)).toBe(0);
  });
});

describe("timeDecay", () => {
  it("is 1 for null / future publish", () => {
    expect(timeDecay(null, NOW, 72)).toBe(1);
    const future = new Date(NOW.getTime() + 3_600_000);
    expect(timeDecay(future, NOW, 72)).toBe(1);
  });

  it("halves every half-life", () => {
    const oneHalfLifeAgo = new Date(NOW.getTime() - 72 * 3_600_000);
    expect(timeDecay(oneHalfLifeAgo, NOW, 72)).toBeCloseTo(0.5, 6);
    const twoAgo = new Date(NOW.getTime() - 144 * 3_600_000);
    expect(timeDecay(twoAgo, NOW, 72)).toBeCloseTo(0.25, 6);
  });
});

describe("computeScore", () => {
  it("keeps a 40% floor even after long decay", () => {
    const input = { ...emptyInput, share_count: 10, published_at: null };
    const raw = rawScore(input, DEFAULT_WEIGHTS); // 100
    // decay -> ~0 (1000 half-lives) but floor is 0.4·raw
    const ancient = {
      ...input,
      published_at: new Date(NOW.getTime() - 72_000 * 3_600_000).toISOString(),
    };
    expect(computeScore(ancient, NOW)).toBeCloseTo(0.4 * raw, 4);
  });

  it("gives fresh content the full multiplier", () => {
    const fresh = {
      ...emptyInput,
      share_count: 10,
      published_at: NOW.toISOString(),
    };
    expect(computeScore(fresh, NOW)).toBeCloseTo(100, 4); // raw·(0.4+0.6·1)
  });
});

describe("rankAll", () => {
  it("ranks by score desc, dense 1-based, deterministic ties", () => {
    const ranked = rankAll(
      [
        { id: "a", s: 10, t: 1 },
        { id: "b", s: 30, t: 0 },
        { id: "c", s: 10, t: 5 },
      ],
      (x) => x.s,
      (x) => x.t,
    );
    expect(ranked.map((r) => r.item.id)).toEqual(["b", "c", "a"]);
    expect(ranked.map((r) => r.rank)).toEqual([1, 2, 3]);
  });
});

describe("reactionWeight", () => {
  it("halves reactions from accounts younger than 24h", () => {
    expect(reactionWeight({ accountAgeHours: 5, kind: "like" })).toBe(0.5);
    expect(reactionWeight({ accountAgeHours: 48, kind: "like" })).toBe(1);
  });

  it("drops shares past the 3/day cap", () => {
    expect(
      reactionWeight({
        accountAgeHours: 100,
        kind: "share",
        userShareCountToday: 3,
      }),
    ).toBe(0);
    expect(
      reactionWeight({
        accountAgeHours: 100,
        kind: "share",
        userShareCountToday: 2,
      }),
    ).toBe(1);
  });
});

describe("rankDelta", () => {
  it("returns null for NEW entries and signed movement otherwise", () => {
    expect(rankDelta(3, null)).toBeNull();
    expect(rankDelta(3, 5)).toBe(2); // climbed 2
    expect(rankDelta(7, 4)).toBe(-3); // fell 3
  });
});
