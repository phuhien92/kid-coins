import { useRouter } from "next/navigation";
import { prepareProfileSwitch, PROFILE_PICKER_PATH } from "@/lib/profile-switch";

/** Navigate to the profile picker after clearing any active kid session. */
export function useProfileSwitch() {
  const router = useRouter();

  return () => {
    prepareProfileSwitch();
    router.push(PROFILE_PICKER_PATH);
  };
}
