import { OrnamentDivider } from "./OrnamentDivider";

export function Hero() {
  return (
    <section className="bg-paper px-6 pb-10 pt-16 md:px-10 md:pb-14 md:pt-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h1 className="font-display text-[clamp(2.35rem,6.5vw,4.75rem)] font-medium leading-[1.15] tracking-[-0.01em] text-ink">
          <span className="block">Clothes with a past.</span>
          <span className="block">Wardrobes with a future.</span>
        </h1>
        <div className="mt-8 md:mt-10">
          <OrnamentDivider />
        </div>
      </div>
    </section>
  );
}
