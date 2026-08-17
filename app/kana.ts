import type { Locale } from "./i18n";

export type KanaScript = "hiragana" | "katakana";

export type KanaEntry = {
  id: string;
  romaji: string;
  hiragana: string;
  katakana: string;
  row: number;
};

export type MasteryRecord = {
  level: number;
  correct: number;
  wrong: number;
  dueAt: number;
};

export type SavedProgress = {
  version: 2;
  records: Record<string, MasteryRecord>;
  unlockedRow: number;
  totalStars: number;
  sessions: number;
  streak: number;
  lastStudyDate: string | null;
  settings: {
    voice: boolean;
    sound: boolean;
    reducedMotion: boolean;
    locale: Locale;
  };
};

const rows = [
  {
    values: [
      ["a", "あ", "ア"], ["i", "い", "イ"], ["u", "う", "ウ"], ["e", "え", "エ"], ["o", "お", "オ"],
    ],
  },
  {
    values: [
      ["ka", "か", "カ"], ["ki", "き", "キ"], ["ku", "く", "ク"], ["ke", "け", "ケ"], ["ko", "こ", "コ"],
    ],
  },
  {
    values: [
      ["sa", "さ", "サ"], ["shi", "し", "シ"], ["su", "す", "ス"], ["se", "せ", "セ"], ["so", "そ", "ソ"],
    ],
  },
  {
    values: [
      ["ta", "た", "タ"], ["chi", "ち", "チ"], ["tsu", "つ", "ツ"], ["te", "て", "テ"], ["to", "と", "ト"],
    ],
  },
  {
    values: [
      ["na", "な", "ナ"], ["ni", "に", "ニ"], ["nu", "ぬ", "ヌ"], ["ne", "ね", "ネ"], ["no", "の", "ノ"],
    ],
  },
  {
    values: [
      ["ha", "は", "ハ"], ["hi", "ひ", "ヒ"], ["fu", "ふ", "フ"], ["he", "へ", "ヘ"], ["ho", "ほ", "ホ"],
    ],
  },
  {
    values: [
      ["ma", "ま", "マ"], ["mi", "み", "ミ"], ["mu", "む", "ム"], ["me", "め", "メ"], ["mo", "も", "モ"],
    ],
  },
  {
    values: [
      ["ya", "や", "ヤ"], ["yu", "ゆ", "ユ"], ["yo", "よ", "ヨ"],
    ],
  },
  {
    values: [
      ["ra", "ら", "ラ"], ["ri", "り", "リ"], ["ru", "る", "ル"], ["re", "れ", "レ"], ["ro", "ろ", "ロ"],
    ],
  },
  {
    values: [
      ["wa", "わ", "ワ"], ["wo", "を", "ヲ"], ["n", "ん", "ン"],
    ],
  },
] as const;

export const KANA: KanaEntry[] = rows.flatMap((row, rowIndex) =>
  row.values.map(([romaji, hiragana, katakana]) => ({
    id: romaji,
    romaji,
    hiragana,
    katakana,
    row: rowIndex,
  })),
);

export const REVIEW_INTERVALS = [0, 10 * 60_000, 86_400_000, 3 * 86_400_000, 7 * 86_400_000, 14 * 86_400_000];

export function createDefaultProgress(locale: Locale = "en"): SavedProgress {
  return {
    version: 2,
    records: {},
    unlockedRow: 0,
    totalStars: 0,
    sessions: 0,
    streak: 0,
    lastStudyDate: null,
    settings: { voice: true, sound: true, reducedMotion: false, locale },
  };
}

export function recordKey(entryId: string, script: KanaScript) {
  return `${entryId}:${script}`;
}

export function applyAnswer(
  progress: SavedProgress,
  entryId: string,
  script: KanaScript,
  correct: boolean,
  now = Date.now(),
): SavedProgress {
  const key = recordKey(entryId, script);
  const current = progress.records[key] ?? { level: 0, correct: 0, wrong: 0, dueAt: 0 };
  const level = correct ? Math.min(5, current.level + 1) : Math.max(0, current.level - 1);
  return {
    ...progress,
    records: {
      ...progress.records,
      [key]: {
        level,
        correct: current.correct + (correct ? 1 : 0),
        wrong: current.wrong + (correct ? 0 : 1),
        dueAt: correct ? now + REVIEW_INTERVALS[level] : now,
      },
    },
  };
}

export function masteryFor(progress: SavedProgress, entry: KanaEntry) {
  const hira = progress.records[recordKey(entry.id, "hiragana")]?.level ?? 0;
  const kata = progress.records[recordKey(entry.id, "katakana")]?.level ?? 0;
  return Math.min(hira, kata);
}

export function getSessionEntries(
  progress: SavedProgress,
  mode: "journey" | "weak",
  now = Date.now(),
) {
  const unlocked = KANA.filter((entry) => entry.row <= progress.unlockedRow);
  if (mode === "weak") {
    return [...unlocked]
      .sort((a, b) => {
        const aWrong = (progress.records[recordKey(a.id, "hiragana")]?.wrong ?? 0) + (progress.records[recordKey(a.id, "katakana")]?.wrong ?? 0);
        const bWrong = (progress.records[recordKey(b.id, "hiragana")]?.wrong ?? 0) + (progress.records[recordKey(b.id, "katakana")]?.wrong ?? 0);
        return bWrong - aWrong || masteryFor(progress, a) - masteryFor(progress, b);
      })
      .slice(0, 3);
  }

  const due = unlocked
    .filter((entry) => ["hiragana", "katakana"].some((script) => {
      const record = progress.records[recordKey(entry.id, script as KanaScript)];
      return record && record.dueAt <= now;
    }))
    .sort((a, b) => masteryFor(progress, a) - masteryFor(progress, b));
  const currentRow = KANA.filter((entry) => entry.row === progress.unlockedRow);
  const unseen = currentRow.filter((entry) =>
    !progress.records[recordKey(entry.id, "hiragana")] ||
    !progress.records[recordKey(entry.id, "katakana")],
  );
  return [...due, ...unseen.filter((entry) => !due.includes(entry)), ...currentRow]
    .filter((entry, index, list) => list.findIndex((item) => item.id === entry.id) === index)
    .slice(0, 3);
}

export function normalizeProgress(value: unknown, locale: Locale = "en"): SavedProgress {
  if (!value || typeof value !== "object" || ![1, 2].includes(Number((value as { version?: unknown }).version))) {
    return createDefaultProgress(locale);
  }
  const candidate = value as Partial<SavedProgress>;
  return {
    ...createDefaultProgress(locale),
    ...candidate,
    version: 2,
    records: candidate.records && typeof candidate.records === "object" ? candidate.records : {},
    settings: { ...createDefaultProgress(locale).settings, ...(candidate.settings ?? {}), locale },
    unlockedRow: Math.max(0, Math.min(rows.length - 1, Number(candidate.unlockedRow) || 0)),
  };
}

export function maybeUnlockNextRow(progress: SavedProgress) {
  const rowEntries = KANA.filter((entry) => entry.row === progress.unlockedRow);
  if (progress.unlockedRow < rows.length - 1 && rowEntries.every((entry) => masteryFor(progress, entry) >= 1)) {
    return { ...progress, unlockedRow: progress.unlockedRow + 1 };
  }
  return progress;
}

export function validateKanaData() {
  return KANA.length === 46 && new Set(KANA.map((entry) => entry.id)).size === 46 && KANA.every((entry) => entry.hiragana && entry.katakana && entry.romaji);
}
