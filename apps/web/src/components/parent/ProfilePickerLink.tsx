import { StampedChipLink } from "@/components/ui";

type ProfilePickerLinkProps = {
  className?: string;
};

/** Parent nav — back to kid profile selection. */
export function ProfilePickerLink({ className }: ProfilePickerLinkProps) {
  return (
    <StampedChipLink href="/profile-picker" className={className}>
      Profile picker →
    </StampedChipLink>
  );
}
