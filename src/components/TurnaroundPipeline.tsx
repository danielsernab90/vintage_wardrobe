import Link from "next/link";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import {
  getPipelineBoard,
  PIPELINE_STAGES,
  type PipelineStage,
} from "@/data/inventory";

export function TurnaroundPipeline() {
  const board = getPipelineBoard();

  return (
    <section className="mt-14 border border-parchment md:mt-16">
      <div className="border-b border-parchment px-5 py-5 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Operations
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink md:text-[1.75rem]">
          Turnaround Pipeline
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-ink/65">
          Static snapshot of where each piece sits between return and next ship —
          consistent with inventory status above.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4">
        {PIPELINE_STAGES.map((stage, index) => (
          <PipelineColumn
            key={stage}
            stage={stage}
            items={board[stage]}
            showDivider={index < PIPELINE_STAGES.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

function PipelineColumn({
  stage,
  items,
  showDivider,
}: {
  stage: PipelineStage;
  items: ReturnType<typeof getPipelineBoard>[PipelineStage];
  showDivider: boolean;
}) {
  return (
    <div
      className={`px-4 py-5 md:px-5 ${
        showDivider ? "border-b border-parchment lg:border-b-0 lg:border-r" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-2 border-b border-parchment pb-3">
        <h3 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink/55">
          {stage}
        </h3>
        <span className="font-mono text-[10px] tabular-nums text-ink/40">
          ({items.length})
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.id} className="border border-parchment/80 bg-paper p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink/45">
              {item.id}
            </p>
            <Link
              href={`/item/${item.id}`}
              className="mt-1 block font-sans text-sm leading-snug text-ink transition-opacity hover:opacity-70"
            >
              {item.name}
            </Link>
            <div className="mt-2">
              <ConditionGradeTag grade={item.grade} />
            </div>
            {stage === "Shipped" && item.shippedTo ? (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
                Shipped to {item.shippedTo}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
