import { clearKidSession } from "./kid-session";

export const PROFILE_PICKER_PATH = "/profile-picker";

/** Clears kid local session before returning to the profile picker. */
export function prepareProfileSwitch() {
  clearKidSession();
}
