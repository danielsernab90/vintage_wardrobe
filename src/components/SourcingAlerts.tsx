"use client";

import { useInventory } from "@/context/InventoryContext";
import { getSourcingAlerts } from "@/data/inventory";

export function SourcingAlerts() {
  const { items } = useInventory();
  const alerts = getSourcingAlerts(items);

  return (
    <section className="mt-14 border border-oxblood/35 bg-paper md:mt-16">
      <div className="border-b border-oxblood/25 px-5 py-5 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-oxblood">
          Intake
        </p>
        <h2 className="mt-2 font-display text-2xl font-medium text-ink md:text-[1.75rem]">
          Sourcing Alerts
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-sm text-ink/65">
          Categories with only one piece in the capsule — thin coverage for the
          next rotation.
        </p>
      </div>

      {alerts.length === 0 ? (
        <p className="px-5 py-10 font-sans text-sm text-ink/60 md:px-6">
          No sourcing gaps right now.
        </p>
      ) : (
        <ul className="divide-y divide-parchment">
          {alerts.map((alert) => (
            <li key={alert.category} className="px-5 py-5 md:px-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-oxblood">
                Low stock · {alert.count} item{alert.count === 1 ? "" : "s"}
              </p>
              <p className="mt-2 font-sans text-sm leading-relaxed text-ink md:text-[0.95rem]">
                {alert.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
