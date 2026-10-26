import { ButtonLink, KidCoinLogo, MascotSlot } from "@/components/ui";
import { StepCard } from "@/components/shared/StepCard";
import { STEPS, SUBLINES, TAGLINE } from "@/lib/brand";

export default function Home() {
  return (
    <div className="min-h-screen bg-page">
      <header className="mx-auto flex max-w-6xl items-center px-6 py-6">
        <KidCoinLogo size="sm" />
      </header>

      <main>
        <section
          aria-labelledby="hero-title"
          className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-6 ipad:grid-cols-2 ipad:pt-12"
        >
          <div className="flex flex-col items-start gap-6">
            <h1 id="hero-title" className="font-display font-black text-5xl ipad:text-6xl text-fg leading-none tracking-tight">
              {TAGLINE}
            </h1>
            <p className="max-w-md font-body text-lg text-fg-muted">
              {SUBLINES[1]} kid-coin turns everyday chores into coins kids can save, spend and grow — with parents cheering
              them on.
            </p>
            <ButtonLink href="/login" className="px-7 py-3.5">
              Get started
            </ButtonLink>
          </div>
          <MascotSlot slot="hero" priority className="mx-auto max-w-md" />
        </section>

        <section aria-labelledby="steps-title" className="bg-surface py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 id="steps-title" className="font-display font-black text-4xl text-fg tracking-tight">
              {SUBLINES[0]}
            </h2>
            <p className="mt-2 font-body text-lg text-fg-muted">{SUBLINES[2]}</p>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 ipad-landscape:grid-cols-5">
              {STEPS.map((step) => (
                <li key={step.id} className="flex">
                  <StepCard step={step.id} className="w-full" />
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 font-body text-sm text-fg-muted">
        <KidCoinLogo size="sm" wordmarkOnly className="mr-3 align-middle" />
        {TAGLINE}
      </footer>
    </div>
  );
}
