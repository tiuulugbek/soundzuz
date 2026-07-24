"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "../../i18n/routing";
import { localePath } from "../../lib/seo";

type Option = { label: string; value: number };
type ResultKey = "low" | "moderate" | "high";

/**
 * Onlayn eshitish o'z-o'zini tekshiruvi (lead-magnit).
 * MUHIM: bu TASHXIS EMAS — faqat kundalik vaziyatlarga asoslangan skrining.
 * Natija foydalanuvchini har doim mutaxassis tekshiruviga yo'naltiradi.
 */
export function HearingCheck() {
  const t = useTranslations("tools.hearingCheck");
  const locale = useLocale() as Locale;

  const questions = t.raw("questions") as string[];
  const options = t.raw("options") as Option[];
  const maxScore = questions.length * Math.max(...options.map((o) => o.value));

  const [stage, setStage] = useState<"intro" | "quiz" | "result">("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(() => questions.map(() => null));

  const score = useMemo(() => answers.reduce<number>((sum, a) => sum + (a ?? 0), 0), [answers]);
  const resultKey: ResultKey = score <= maxScore * 0.3 ? "low" : score <= maxScore * 0.6 ? "moderate" : "high";

  const answered = answers[step] !== null;
  const isLast = step === questions.length - 1;
  const progress = Math.round(((step + (answered ? 1 : 0)) / questions.length) * 100);

  const choose = (value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = value;
      return next;
    });
  };

  const goNext = () => {
    if (isLast) setStage("result");
    else setStep((s) => s + 1);
  };

  const restart = () => {
    setAnswers(questions.map(() => null));
    setStep(0);
    setStage("intro");
  };

  // ---- Intro ----
  if (stage === "intro") {
    return (
      <div className="sz-hc" data-stage="intro">
        <div className="sz-hc__card sz-hc__intro">
          <span className="sz-hc__badge">{t("start.time")}</span>
          <h2 className="sz-hc__intro-title">{t("start.title")}</h2>
          <p className="sz-hc__intro-lead">{t("start.lead")}</p>
          <p className="sz-hc__disclaimer" role="note">{t("disclaimer")}</p>
          <button className="sz-btn sz-btn--primary sz-btn--lg" type="button" onClick={() => setStage("quiz")}>
            <span className="sz-btn__label">{t("start.button")}</span>
          </button>
          <p className="sz-hc__count">{t("start.count", { total: questions.length })}</p>
        </div>
      </div>
    );
  }

  // ---- Result ----
  if (stage === "result") {
    return (
      <div className="sz-hc" data-stage="result">
        <div className={`sz-hc__card sz-hc__result sz-hc__result--${resultKey}`}>
          <div className="sz-hc__meter" aria-hidden>
            <div className="sz-hc__meter-fill" style={{ width: `${Math.round((score / maxScore) * 100)}%` }} />
          </div>
          <p className="sz-hc__score">{t("result.scoreLabel", { score, max: maxScore })}</p>
          <h2 className="sz-hc__result-title">{t(`result.${resultKey}.title`)}</h2>
          <p className="sz-hc__result-body">{t(`result.${resultKey}.body`)}</p>
          <p className="sz-hc__disclaimer" role="note">{t("result.disclaimer")}</p>
          <div className="sz-hc__result-actions">
            <a className="sz-btn sz-btn--primary sz-btn--lg" href={localePath(locale, "/branches")}>
              <span className="sz-btn__label">{t("result.bookCta")}</span>
            </a>
            <a className="sz-btn sz-btn--ghost sz-btn--lg" href={localePath(locale, "/learn")}>
              <span className="sz-btn__label">{t("result.learnCta")}</span>
            </a>
          </div>
          <button className="sz-hc__restart" type="button" onClick={restart}>{t("nav.restart")}</button>
        </div>
      </div>
    );
  }

  // ---- Quiz ----
  return (
    <div className="sz-hc" data-stage="quiz">
      <div className="sz-hc__card">
        <div className="sz-hc__progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="sz-hc__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="sz-hc__step-count">{t("progress", { current: step + 1, total: questions.length })}</p>
        <h2 className="sz-hc__question">{questions[step]}</h2>
        <div className="sz-hc__options" role="radiogroup" aria-label={questions[step]}>
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={answers[step] === opt.value}
              className={`sz-hc__option ${answers[step] === opt.value ? "is-selected" : ""}`.trim()}
              onClick={() => choose(opt.value)}
            >
              <span className="sz-hc__option-dot" aria-hidden />
              {opt.label}
            </button>
          ))}
        </div>
        <div className="sz-hc__nav">
          <button
            className="sz-hc__nav-back"
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            ← {t("nav.back")}
          </button>
          <button className="sz-btn sz-btn--primary sz-btn--md" type="button" onClick={goNext} disabled={!answered}>
            <span className="sz-btn__label">{isLast ? t("nav.seeResult") : t("nav.next")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
