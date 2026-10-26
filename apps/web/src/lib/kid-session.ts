const KID_ID_HEADER = "x-kid-id";
const KID_SESSION_TOKEN_HEADER = "x-kid-session-token";
export const KID_AVATAR_COLOR_KEY = "earnie_kid_avatar_color";
export const KID_SESSION_TOKEN_KEY = "earnie_kid_token";

export function clearKidSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("earnie_char");
  localStorage.removeItem("earnie_kid_id");
  localStorage.removeItem("earnie_kid_name");
  localStorage.removeItem(KID_AVATAR_COLOR_KEY);
  localStorage.removeItem(KID_SESSION_TOKEN_KEY);
}

export function kidSessionHeaders(kidId: string): HeadersInit {
  const token =
    typeof window !== "undefined" ? (localStorage.getItem(KID_SESSION_TOKEN_KEY) ?? "") : "";
  return { [KID_ID_HEADER]: kidId, [KID_SESSION_TOKEN_HEADER]: token };
}
