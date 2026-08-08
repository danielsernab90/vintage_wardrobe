import type { Metadata } from "next";
import Link from "next/link";
import { OrnamentDivider } from "@/components/OrnamentDivider";
import { ConditionGradeTag } from "@/components/ConditionGradeTag";
import { GarmentImage } from "@/components/GarmentImage";
import { ButtonLink } from "@/components/ButtonLink";
import {
  activeRentals,
  memberImpact,
  mockMember,
  rentalHistory,
} from "@/data/closet";

export const metadata: Metadata = {
  title: "My Closet — Archive No.",
  description: "Your active rotation and rental history.",
};

export default function AccountPage() {
  return (
    <section className="bg-paper px-5 pb-20 pt-14 md:px-10 md:pb-28 md:pt-20">
      <div className="mx-auto flex max-w-6xl flex-col items-center">
        <header className="flex flex-col items-center text-center">
          <h1 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-medium leading-[1.2] tracking-[-0.01em] text-ink">
            My Closet
          </h1>
          <div className="mt-6 md:mt-8">
            <OrnamentDivider />
          </div>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
            {mockMember.name} · {mockMember.plan} · Member since{" "}
            {mockMember.memberSince}
          </p>
        </header>

        <div className="mt-12 w-full border-t border-parchment pt-12 md:mt-14 md:pt-14">
          <p className="mx-auto max-w-xl text-center font-sans text-sm leading-relaxed text-ink/70">
            Every rotation keeps clothing in use longer and out of landfills.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6 md:mt-12 md:gap-8">
            <div className="text-center">
              <p className="font-display text-4xl text-bottle md:text-5xl">
                {memberImpact.garmentsKeptFromLandfill}
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                Garments kept from landfill
              </p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl text-bottle md:text-5xl">
                {memberImpact.textileWasteDivertedLbs}
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                Lbs of textile waste diverted
              </p>
            </div>
            <div className="text-center">
              <p className="font-display text-4xl text-bottle md:text-5xl">
                {memberImpact.cyclesCompleted}
              </p>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/55">
                Cycles completed
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 w-full md:mt-16">
          <h2 className="font-display text-2xl font-medium text-ink md:text-[1.75rem]">
            Currently Wearing
          </h2>
          <p className="mt-2 font-sans text-sm text-ink/65">
            Active pieces in this month&apos;s rotation.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3">
            {activeRentals.map(({ garment, daysUntilSwap }) => (
              <Link
                key={garment.id}
                href={`/item/${garment.id}`}
                className="group block bg-paper transition-opacity hover:opacity-80"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-parchment">
                  <GarmentImage
                    src={garment.image}
                    alt={garment.name}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <ConditionGradeTag
                    grade={garment.grade}
                    className="absolute top-0 right-0 z-10"
                  />
                </div>
                <div className="border-t border-parchment px-4 py-4 md:px-5 md:py-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brass">
                    Swap available in {daysUntilSwap} days
                  </p>
                  <h3 className="mt-2 font-display text-lg leading-snug text-ink md:text-xl">
                    {garment.name}
                  </h3>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/65">
                    {garment.era} · {garment.fabric}
                  </p>
                  <p className="mt-3 font-display text-xl text-bottle">
                    ${garment.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-16 w-full border-t border-parchment pt-12 md:mt-20 md:pt-16">
          <h2 className="font-display text-2xl font-medium text-ink md:text-[1.75rem]">
            Rental History
          </h2>
          <p className="mt-2 font-sans text-sm text-ink/65">
            Past pieces returned to the archive.
          </p>

          <div className="mt-8 w-full">
            {/* Mobile stacked history */}
            <ul className="divide-y divide-parchment md:hidden">
              {rentalHistory.map((entry) => (
                <li key={`${entry.garment.id}-${entry.wornFrom}`} className="py-4">
                  <Link
                    href={`/item/${entry.garment.id}`}
                    className="font-display text-lg text-ink transition-opacity hover:opacity-70"
                  >
                    {entry.garment.name}
                  </Link>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ink/55">
                    {entry.garment.era} · {entry.wornFrom} – {entry.wornTo}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45">
                    {entry.status}
                  </p>
                </li>
              ))}
            </ul>

            {/* Desktop/tablet table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[36rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-parchment">
                    <th className="pb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink/50">
                      Item
                    </th>
                    <th className="pb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink/50">
                      Era
                    </th>
                    <th className="pb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink/50">
                      Worn
                    </th>
                    <th className="pb-3 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-ink/50">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rentalHistory.map((entry) => (
                    <tr
                      key={`${entry.garment.id}-${entry.wornFrom}`}
                      className="border-b border-parchment/70"
                    >
                      <td className="py-4 pr-4 font-display text-base text-ink md:text-lg">
                        <Link
                          href={`/item/${entry.garment.id}`}
                          className="transition-opacity hover:opacity-70"
                        >
                          {entry.garment.name}
                        </Link>
                      </td>
                      <td className="py-4 pr-4 font-mono text-[11px] uppercase tracking-[0.14em] text-ink/65">
                        {entry.garment.era}
                      </td>
                      <td className="py-4 pr-4 font-mono text-[11px] uppercase tracking-[0.12em] text-ink/65">
                        {entry.wornFrom} – {entry.wornTo}
                      </td>
                      <td className="py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-ink/50">
                        {entry.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-16 flex w-full flex-col items-center border-t border-parchment pt-14 text-center md:mt-20 md:pt-16">
          <h2 className="font-display text-[clamp(1.5rem,3vw,2.25rem)] font-medium leading-snug text-ink">
            Next Swap
          </h2>
          <p className="mt-3 max-w-md font-sans text-sm text-ink/65">
            Browse the current capsule and queue pieces for your next rotation.
          </p>
          <div className="mt-8 w-full max-w-xs">
            <ButtonLink href="/#catalog">Browse This Month&apos;s Capsule</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
