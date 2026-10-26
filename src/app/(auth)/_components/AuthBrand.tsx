import { KidCoinLogo } from "@/components/ui";
import { TAGLINE } from "@/lib/brand";

/** kid-coin brand lockup shown above every auth card (login, signup, etc.). */
export function AuthBrand() {
  return (
    <div className="flex flex-col items-center gap-3 mb-8 text-center">
      <h1>
        <KidCoinLogo size="md" />
      </h1>
      <p className="font-body font-semibold text-base text-ink-soft">{TAGLINE}</p>
    </div>
  );
}
