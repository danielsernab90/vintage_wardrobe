"use client";

import { useState } from "react";
import { OrnamentDivider } from "@/components/OrnamentDivider";
import { CatalogTile } from "@/components/CatalogTile";
import { JoinWaitlistButton } from "@/components/JoinWaitlistButton";
import {
  recommendCapsule,
  type FitAnswer,
  type QuizAnswers,
  type SizeAnswer,
  type StyleAnswer,
} from "@/data/quiz";

type Step = 1 | 2 | 3 | "results";

const choiceClass =
  "w-full border border-ink/20 bg-paper px-5 py-4 text-left font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-ink transition-opacity hover:opacity-70 hover:border-ink";

export function QuizFlow() {
  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});

  const recommendations =
    step === "results" && answers.style && answers.size && answers.fit
      ? recommendCapsule(answers as QuizAnswers)
      : [];

  function chooseStyle(style: StyleAnswer) {
    setAnswers((prev) => ({ ...prev, style }));
    setStep(2);
  }

  function chooseSize(size: SizeAnswer) {
    setAnswers((prev) => ({ ...prev, size }));
    setStep(3);
  }

  function chooseFit(fit: FitAnswer) {
    setAnswers((prev) => ({ ...prev, fit }));
    setStep("results");
  }

  if (step === "results") {
    return (
      <section className="bg-paper px-5 pb-20 pt-14 md:px-10 md:pb-28 md:pt-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center">
          <header className="flex flex-col items-center text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
              Results
            </p>
            <h1 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
              Your Recommended Capsule
            </h1>
            <div className="mt-6 md:mt-8">
              <OrnamentDivider />
            </div>
            <p className="mt-6 max-w-lg font-sans text-sm leading-relaxed text-ink/70">
              Based on your answers, these pieces are a strong starting rotation
              from this month&apos;s capsule.
            </p>
          </header>

          <div className="mt-12 grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommendations.map((garment, index) => (
              <CatalogTile
                key={garment.id}
                garment={garment}
                priority={index < 2}
              />
            ))}
          </div>

          <div className="mt-14 w-full max-w-xs">
            <JoinWaitlistButton />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-paper px-5 pb-20 pt-14 md:px-10 md:pb-28 md:pt-24">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-brass">
          {step} of 3
        </p>

        {step === 1 ? (
          <>
            <h1 className="mt-8 font-display text-[clamp(1.85rem,4vw,2.75rem)] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
              What&apos;s your style?
            </h1>
            <div className="mt-10 flex w-full flex-col gap-3">
              <button
                type="button"
                className={choiceClass}
                onClick={() => chooseStyle("workwear")}
              >
                Workwear &amp; Military
              </button>
              <button
                type="button"
                className={choiceClass}
                onClick={() => chooseStyle("tailored")}
              >
                Tailored &amp; Classic
              </button>
              <button
                type="button"
                className={choiceClass}
                onClick={() => chooseStyle("casual")}
              >
                Casual &amp; Denim
              </button>
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="mt-8 font-display text-[clamp(1.85rem,4vw,2.75rem)] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
              What&apos;s your size?
            </h1>
            <div className="mt-10 grid w-full grid-cols-2 gap-3">
              {(["S", "M", "L", "XL"] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  className={choiceClass}
                  onClick={() => chooseSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className="mt-8 font-display text-[clamp(1.85rem,4vw,2.75rem)] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
              How do you like your fit?
            </h1>
            <div className="mt-10 flex w-full flex-col gap-3">
              <button
                type="button"
                className={choiceClass}
                onClick={() => chooseFit("relaxed")}
              >
                Relaxed
              </button>
              <button
                type="button"
                className={choiceClass}
                onClick={() => chooseFit("fitted")}
              >
                Fitted
              </button>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
