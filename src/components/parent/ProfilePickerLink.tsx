import { ProfileSwitchAction } from "@/components/shared/AppNav/ProfileSwitchAction";

type ProfilePickerLinkProps = {
  className?: string;
};

/** Parent surfaces — back to profile selection. */
export function ProfilePickerLink({ className }: ProfilePickerLinkProps) {
  return <ProfileSwitchAction register="parent" className={className} />;
}
