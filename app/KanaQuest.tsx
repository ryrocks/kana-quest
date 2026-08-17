"use client";

import { useEffect, useMemo, useState } from "react";
import {
  applyAnswer,
  createDefaultProgress,
  getSessionEntries,
  KANA,
  KanaEntry,
  KanaScript,
  masteryFor,
  maybeUnlockNextRow,
  normalizeProgress,
  recordKey,
  SavedProgress,
} from "./kana";
import { KANA_HINTS, Locale, LOCALE_NAMES, LOCALES, MESSAGES } from "./i18n";

type Screen = "home" | "lesson" | "quiz" | "result" | "chart" | "settings";
type Question = {
  id: string;
  entry: KanaEntry;
  script: KanaScript;
  kind: "sound" | "pair" | "recall";
  prompt: string;
  options: string[];
  answer: string;
  retry?: boolean;
};

const STORAGE_KEY = "kana-quest-progress-v1";

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function optionsFor(entry: KanaEntry, value: "romaji" | KanaScript, pool: KanaEntry[]) {
  const key = value === "hiragana" ? "hiragana" : value === "katakana" ? "katakana" : "romaji";
  const nearby = [...pool, ...KANA.filter((item) => item.row === entry.row), ...KANA]
    .filter((item, index, list) => item.id !== entry.id && list.findIndex((candidate) => candidate.id === item.id) === index);
  const answer = entry[key];
  return shuffle([answer, ...shuffle(nearby).slice(0, 3).map((item) => item[key])]);
}

function buildQuestions(entries: KanaEntry[]): Question[] {
  return shuffle(entries.flatMap((entry) => [
    {
      id: `${entry.id}-hira-sound`, entry, script: "hiragana" as const, kind: "sound" as const,
      prompt: entry.hiragana, options: optionsFor(entry, "romaji", entries), answer: entry.romaji,
    },
    {
      id: `${entry.id}-kata-sound`, entry, script: "katakana" as const, kind: "sound" as const,
      prompt: entry.katakana, options: optionsFor(entry, "romaji", entries), answer: entry.romaji,
    },
    {
      id: `${entry.id}-pair`, entry, script: "katakana" as const, kind: "pair" as const,
      prompt: entry.hiragana, options: optionsFor(entry, "katakana", entries), answer: entry.katakana,
    },
    {
      id: `${entry.id}-recall`, entry, script: "hiragana" as const, kind: "recall" as const,
      prompt: entry.romaji, options: optionsFor(entry, "hiragana", entries), answer: entry.hiragana,
    },
  ]));
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function yesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return localDateKey(date);
}

export default function KanaQuest({ locale }: { locale: Locale }) {
  const messages = MESSAGES[locale];
  const [progress, setProgress] = useState<SavedProgress>(() => createDefaultProgress(locale));
  const [ready, setReady] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [entries, setEntries] = useState<KanaEntry[]>([]);
  const [lessonIndex, setLessonIndex] = useState(0);
  const [queue, setQueue] = useState<Question[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ chosen: string; correct: boolean } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [newlyUnlocked, setNewlyUnlocked] = useState(false);

  useEffect(() => {
    const loadProgress = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setProgress(normalizeProgress(JSON.parse(saved), locale));
      } catch {
        setProgress(createDefaultProgress(locale));
      }
      setVoiceAvailable("speechSynthesis" in window && "SpeechSynthesisUtterance" in window);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(loadProgress);
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = "ltr";
  }, [locale]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress, ready]);

  const mastered = useMemo(() => KANA.filter((entry) => masteryFor(progress, entry) >= 3).length, [progress]);
  const currentQuestion = queue[questionIndex];
  const lessonEntry = entries[lessonIndex];
  const completion = Math.round((mastered / KANA.length) * 100);

  function speak(entry: KanaEntry) {
    if (!progress.settings.voice || !voiceAvailable) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(entry.hiragana);
    utterance.lang = "ja-JP";
    utterance.rate = 0.75;
    window.speechSynthesis.speak(utterance);
  }

  function playAnswerTone(correct: boolean) {
    if (!progress.settings.sound || typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = correct ? 660 : 220;
    gain.gain.setValueAtTime(0.06, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.16);
    oscillator.addEventListener("ended", () => void context.close());
  }

  function startSession(mode: "journey" | "weak") {
    const selected = getSessionEntries(progress, mode);
    setEntries(selected);
    setLessonIndex(0);
    setQueue(buildQuestions(selected));
    setQuestionIndex(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setFeedback(null);
    setNewlyUnlocked(false);
    setScreen("lesson");
  }

  function beginQuiz() {
    setScreen("quiz");
  }

  function answer(option: string) {
    if (!currentQuestion || feedback) return;
    const correct = option === currentQuestion.answer;
    playAnswerTone(correct);
    setFeedback({ chosen: option, correct });
    setAnsweredCount((value) => value + 1);
    if (correct) setCorrectCount((value) => value + 1);
    setProgress((current) => applyAnswer(current, currentQuestion.entry.id, currentQuestion.script, correct));
    if (!correct && !currentQuestion.retry) {
      setQueue((current) => {
        const copy = [...current];
        copy.splice(Math.min(questionIndex + 4, copy.length), 0, { ...currentQuestion, id: `${currentQuestion.id}-retry`, retry: true });
        return copy;
      });
    }
  }

  function nextQuestion() {
    setFeedback(null);
    if (questionIndex < queue.length - 1) {
      setQuestionIndex((value) => value + 1);
      return;
    }
    const today = localDateKey();
    setProgress((current) => {
      const withSession: SavedProgress = {
        ...current,
        sessions: current.sessions + 1,
        totalStars: current.totalStars + Math.max(1, Math.round((correctCount / Math.max(1, answeredCount)) * 3)),
        streak: current.lastStudyDate === today ? current.streak : current.lastStudyDate === yesterdayKey() ? current.streak + 1 : 1,
        lastStudyDate: today,
      };
      const unlocked = maybeUnlockNextRow(withSession);
      setNewlyUnlocked(unlocked.unlockedRow > withSession.unlockedRow);
      return unlocked;
    });
    setScreen("result");
  }

  useEffect(() => {
    if (screen !== "quiz") return;
    function onKey(event: KeyboardEvent) {
      if (feedback && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        nextQuestion();
        return;
      }
      const choice = Number(event.key) - 1;
      if (!feedback && currentQuestion && choice >= 0 && choice < currentQuestion.options.length) answer(currentQuestion.options[choice]);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function resetProgress() {
    if (!window.confirm(messages.settingsPanel.resetConfirm)) return;
    setProgress(createDefaultProgress(locale));
    setScreen("home");
  }

  function changeLocale(nextLocale: Locale) {
    const nextProgress: SavedProgress = { ...progress, settings: { ...progress.settings, locale: nextLocale } };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProgress));
    const nextUrl = new URL(window.location.href);
    nextUrl.pathname = `/${nextLocale}`;
    window.location.assign(nextUrl.toString());
  }

  if (!ready) return <main className="loading-screen">{messages.loading}</main>;

  return (
    <main className={`app-shell ${progress.settings.reducedMotion ? "reduce-motion" : ""}`}>
      <div className="sun-disc" aria-hidden="true" />
      <div className="mountain mountain-one" aria-hidden="true" />
      <div className="mountain mountain-two" aria-hidden="true" />
      <header className="topbar">
        <button className="brand" onClick={() => setScreen("home")} aria-label={messages.homeAria}>
          <span className="brand-mark">あ</span>
          <span><strong>{messages.brand}</strong><small>KANA QUEST</small></span>
        </button>
        <div className="top-stats">
          <span title={messages.starsTitle}>★ {progress.totalStars}</span>
          <span title={messages.streakTitle}>火 {progress.streak}</span>
          <label className="language-picker"><span>{messages.language}</span><select value={locale} onChange={(event) => changeLocale(event.target.value as Locale)}>{LOCALES.map((item) => <option value={item} key={item}>{LOCALE_NAMES[item]}</option>)}</select></label>
          <button className="icon-button" onClick={() => setScreen("settings")} aria-label={messages.settings}>{messages.settings}</button>
        </div>
      </header>

      {screen === "home" && (
        <section className="home-grid">
          <div className="hero-copy">
            <p className="kicker">{messages.home.kicker}</p>
            <h1>{messages.home.title}<br /><em>{messages.home.titleEmphasis}</em></h1>
            <p className="hero-lead">{messages.home.lead}</p>
            <div className="hero-actions">
              <button className="primary-button" onClick={() => startSession("journey")}>
                <span>{messages.home.start}</span><b>{messages.home.duration}</b>
              </button>
              <button className="secondary-button" onClick={() => startSession("weak")}>{messages.home.weak}</button>
            </div>
            <div className="progress-card">
              <div><span>{messages.home.progress}</span><strong>{completion}%</strong></div>
              <div className="progress-track"><i style={{ width: `${completion}%` }} /></div>
              <p>{messages.home.mastered(mastered)} · {messages.home.current(messages.rows[progress.unlockedRow])}</p>
            </div>
          </div>

          <div className="journey-panel" aria-label={messages.home.mapAria}>
            <div className="panel-heading"><span>{messages.home.map}</span><button onClick={() => setScreen("chart")}>{messages.home.collection}</button></div>
            <div className="path-line" aria-hidden="true" />
            <div className="map-list">
              {messages.rows.map((name, index) => {
                const locked = index > progress.unlockedRow;
                const rowKana = KANA.filter((entry) => entry.row === index).map((entry) => entry.hiragana).join(" · ");
                return (
                  <div className={`map-stop ${locked ? "locked" : ""} ${index === progress.unlockedRow ? "current" : ""}`} key={name}>
                    <span className="stop-marker">{locked ? "—" : index < progress.unlockedRow ? "✓" : "◉"}</span>
                    <div><small>{messages.home.station(index + 1)}</small><strong>{name}</strong><p>{locked ? messages.home.locked : rowKana}</p></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {screen === "lesson" && lessonEntry && (
        <section className="focus-screen">
          <button className="back-link" onClick={() => setScreen("home")}>{messages.lesson.pause}</button>
          <div className="stage-label"><span>{messages.lesson.label}</span><b>{lessonIndex + 1} / {entries.length}</b></div>
          <article className="lesson-card">
            <p className="kicker">{messages.lesson.sameSound}</p>
            <div className="kana-pair"><span>{lessonEntry.hiragana}</span><i /><span>{lessonEntry.katakana}</span></div>
            <div className="romaji">{lessonEntry.romaji}</div>
            <p className="mnemonic">「{KANA_HINTS[locale][lessonEntry.id]}」</p>
            {voiceAvailable && <button className="voice-button" onClick={() => speak(lessonEntry)}>{messages.lesson.listen}</button>}
          </article>
          <button className="primary-button wide" onClick={() => lessonIndex < entries.length - 1 ? setLessonIndex((value) => value + 1) : beginQuiz()}>
            <span>{lessonIndex < entries.length - 1 ? messages.lesson.next : messages.lesson.gate}</span><b>→</b>
          </button>
        </section>
      )}

      {screen === "quiz" && currentQuestion && (
        <section className="focus-screen quiz-screen">
          <div className="quiz-topline">
            <button className="back-link" onClick={() => setScreen("home")}>{messages.quiz.pause}</button>
            <div className="question-progress"><i style={{ width: `${((questionIndex + 1) / queue.length) * 100}%` }} /></div>
            <span>{questionIndex + 1}/{queue.length}</span>
          </div>
          <div className="question-block">
            <p className="kicker">{currentQuestion.kind === "pair" ? messages.quiz.pairEyebrow : currentQuestion.kind === "recall" ? messages.quiz.recallEyebrow : messages.quiz.soundEyebrow}</p>
            <h2>{currentQuestion.kind === "pair" ? messages.quiz.pairQuestion : currentQuestion.kind === "recall" ? messages.quiz.recallQuestion : messages.quiz.soundQuestion}</h2>
            <div className={`question-glyph ${currentQuestion.kind === "recall" ? "latin" : ""}`}>{currentQuestion.prompt}</div>
            {voiceAvailable && currentQuestion.kind !== "recall" && <button className="mini-voice" onClick={() => speak(currentQuestion.entry)} aria-label={messages.quiz.playSound}>音</button>}
          </div>
          <div className="answer-grid">
            {currentQuestion.options.map((option, index) => {
              const state = feedback ? option === currentQuestion.answer ? "correct" : option === feedback.chosen ? "wrong" : "muted" : "";
              return <button className={`answer-button ${state}`} key={option} onClick={() => answer(option)} disabled={Boolean(feedback)}><kbd>{index + 1}</kbd><span>{option}</span></button>;
            })}
          </div>
          {feedback && (
            <div className={`feedback-bar ${feedback.correct ? "is-correct" : "is-wrong"}`} role="status">
              <div><strong>{feedback.correct ? messages.quiz.correct : messages.quiz.wrong(currentQuestion.entry.hiragana, currentQuestion.entry.katakana, currentQuestion.entry.romaji)}</strong><small>{feedback.correct ? messages.quiz.mastery : messages.quiz.retry}</small></div>
              <button onClick={nextQuestion}>{messages.quiz.continue} <span>Enter</span></button>
            </div>
          )}
        </section>
      )}

      {screen === "result" && (
        <section className="focus-screen result-screen">
          <div className="result-emblem">守</div>
          <p className="kicker">{messages.result.kicker}</p>
          <h2>{newlyUnlocked ? messages.result.unlocked : messages.result.complete}</h2>
          <p>{messages.result.summary(answeredCount, correctCount)}</p>
          <div className="result-stats">
            <div><span>{messages.result.accuracy}</span><strong>{Math.round((correctCount / Math.max(1, answeredCount)) * 100)}%</strong></div>
            <div><span>{messages.result.mastered}</span><strong>{mastered} / 46</strong></div>
            <div><span>{messages.result.streak}</span><strong>{messages.result.days(progress.streak)}</strong></div>
          </div>
          <div className="hero-actions centered"><button className="primary-button" onClick={() => setScreen("home")}><span>{messages.result.back}</span><b>→</b></button><button className="secondary-button" onClick={() => startSession("journey")}>{messages.result.again}</button></div>
        </section>
      )}

      {screen === "chart" && (
        <section className="library-screen">
          <div className="section-heading"><div><p className="kicker">{messages.library.kicker}</p><h2>{messages.library.title}</h2></div><button className="secondary-button" onClick={() => setScreen("home")}>{messages.result.back}</button></div>
          <p className="library-intro">{messages.library.intro}</p>
          <div className="kana-library">
            {KANA.map((entry) => {
              const locked = entry.row > progress.unlockedRow;
              const hiraLevel = progress.records[recordKey(entry.id, "hiragana")]?.level ?? 0;
              const kataLevel = progress.records[recordKey(entry.id, "katakana")]?.level ?? 0;
              return <article className={`library-card ${locked ? "locked" : ""}`} key={entry.id}><small>{entry.romaji}</small><div><span style={{ opacity: locked ? .18 : .35 + hiraLevel * .13 }}>{entry.hiragana}</span><span style={{ opacity: locked ? .18 : .35 + kataLevel * .13 }}>{entry.katakana}</span></div><i>{locked ? messages.library.locked : messages.library.mastery(Math.min(hiraLevel, kataLevel))}</i></article>;
            })}
          </div>
        </section>
      )}

      {screen === "settings" && (
        <section className="settings-screen">
          <div className="section-heading"><div><p className="kicker">{messages.settingsPanel.kicker}</p><h2>{messages.settingsPanel.title}</h2></div><button className="secondary-button" onClick={() => setScreen("home")}>{messages.settingsPanel.done}</button></div>
          <div className="settings-card">
            {([
              ["voice", messages.settingsPanel.voice, messages.settingsPanel.voiceDescription],
              ["sound", messages.settingsPanel.sound, messages.settingsPanel.soundDescription],
              ["reducedMotion", messages.settingsPanel.motion, messages.settingsPanel.motionDescription],
            ] as const).map(([key, title, description]) => <div className="setting-row" key={key}><span><strong>{title}</strong><small>{description}</small></span><input aria-label={title} id={`setting-${key}`} type="checkbox" checked={progress.settings[key]} onChange={(event) => setProgress((current) => ({ ...current, settings: { ...current.settings, [key]: event.target.checked } }))} /></div>)}
          </div>
          <div className="danger-zone"><div><strong>{messages.settingsPanel.restart}</strong><p>{messages.settingsPanel.restartDescription}</p></div><button onClick={resetProgress}>{messages.settingsPanel.reset}</button></div>
        </section>
      )}

      <footer><span>{messages.footer.slogan}</span><span>{messages.footer.local}</span></footer>
    </main>
  );
}
