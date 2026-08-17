import { describe, expect, it } from "vitest";
import { detectLocale, KANA_HINTS, LOCALES, MESSAGES } from "../app/i18n";
import { applyAnswer, createDefaultProgress, getSessionEntries, KANA, normalizeProgress, recordKey, REVIEW_INTERVALS, validateKanaData } from "../app/kana";

describe("假名資料", () => {
  it("包含 46 組唯一且完整的平片假名", () => {
    expect(validateKanaData()).toBe(true);
    expect(KANA).toHaveLength(46);
    expect(new Set(KANA.map((entry) => entry.hiragana)).size).toBe(46);
    expect(new Set(KANA.map((entry) => entry.katakana)).size).toBe(46);
  });
});

describe("複習排程", () => {
  it("答對提升熟練度並排定下次複習", () => {
    const now = 1_000_000;
    const next = applyAnswer(createDefaultProgress(), "a", "hiragana", true, now);
    expect(next.records[recordKey("a", "hiragana")]).toMatchObject({ level: 1, correct: 1, wrong: 0, dueAt: now + REVIEW_INTERVALS[1] });
  });

  it("答錯降低熟練度並立即到期", () => {
    const now = 2_000_000;
    const learned = applyAnswer(applyAnswer(createDefaultProgress(), "a", "katakana", true, 0), "a", "katakana", true, 1);
    const next = applyAnswer(learned, "a", "katakana", false, now);
    expect(next.records[recordKey("a", "katakana")]).toMatchObject({ level: 1, correct: 2, wrong: 1, dueAt: now });
  });
});

describe("旅程選題與存檔", () => {
  it("新玩家第一次只學三組", () => {
    expect(getSessionEntries(createDefaultProgress(), "journey", 0).map((entry) => entry.id)).toEqual(["a", "i", "u"]);
  });

  it("損壞或未知版本的存檔會安全重建", () => {
    expect(normalizeProgress(null)).toEqual(createDefaultProgress());
    expect(normalizeProgress({ version: 99, unlockedRow: 8 })).toEqual(createDefaultProgress());
  });

  it("v1 存檔升級後保留進度並套用目前語系", () => {
    const legacy = {
      version: 1,
      records: { "a:hiragana": { level: 2, correct: 3, wrong: 1, dueAt: 123 } },
      unlockedRow: 4,
      totalStars: 12,
      sessions: 5,
      streak: 3,
      lastStudyDate: "2026-08-16",
      settings: { voice: false, sound: true, reducedMotion: true },
    };

    expect(normalizeProgress(legacy, "es")).toMatchObject({
      version: 2,
      records: legacy.records,
      unlockedRow: 4,
      totalStars: 12,
      sessions: 5,
      streak: 3,
      lastStudyDate: "2026-08-16",
      settings: { voice: false, sound: true, reducedMotion: true, locale: "es" },
    });
  });
});

describe("多語系", () => {
  it("支援四種介面語言且每種都有十個關卡名稱", () => {
    expect(LOCALES).toEqual(["en", "zh-Hant", "zh-Hans", "es"]);
    for (const locale of LOCALES) expect(MESSAGES[locale].rows).toHaveLength(10);
  });

  it("每種語言都有完整的 46 組記憶提示", () => {
    const kanaIds = KANA.map((entry) => entry.id).sort();
    for (const locale of LOCALES) {
      expect(Object.keys(KANA_HINTS[locale]).sort()).toEqual(kanaIds);
      expect(Object.values(KANA_HINTS[locale]).every(Boolean)).toBe(true);
    }
  });

  it("依瀏覽器語言選擇最接近的介面", () => {
    expect(detectLocale(["zh-TW"])).toBe("zh-Hant");
    expect(detectLocale(["zh-HK"])).toBe("zh-Hant");
    expect(detectLocale(["zh-CN"])).toBe("zh-Hans");
    expect(detectLocale(["es-MX"])).toBe("es");
    expect(detectLocale(["fr-FR", "en-AU"])).toBe("en");
    expect(detectLocale(["fr-FR"])).toBe("en");
  });
});
