import { MascotSlot } from "@/components/ui";
import { SUBLINES } from "@/lib/brand";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page ipad-landscape:grid ipad-landscape:grid-cols-2">
      {/* Brand panel — desktop only; the form column carries the logo on mobile. */}
      <aside
        aria-label="About kid-coin"
        className="hidden ipad-landscape:flex flex-col items-center justify-center gap-8 bg-step-do-tint px-12 py-16"
      >
        <MascotSlot slot="hero" priority className="max-w-sm" />
        <ul className="flex flex-col items-center gap-1 text-center">
          {SUBLINES.map((line) => (
            <li key={line} className="font-display font-extrabold text-xl text-fg">
              {line}
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
