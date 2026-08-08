import { getActivityLog } from "@/data/activity";

export function ActivityLog() {
  const entries = getActivityLog();

  return (
    <section className="mt-14 border border-parchment bg-paper md:mt-16">
      <div className="border-b border-parchment px-5 py-5 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-brass">
          Timeline
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink md:text-[1.75rem]">
          Recent Activity
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-ink/65">
          A read-only feed of recent inventory, decision, and subscriber events
          across the archive.
        </p>
      </div>

      <ul className="divide-y divide-parchment">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-5 md:px-6"
          >
            <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ink/45 sm:w-20">
              {entry.when}
            </p>
            <p className="font-sans text-sm leading-relaxed text-ink">
              {entry.description}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
