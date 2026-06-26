const KID_ID_HEADER = "x-kid-id";
export const KID_AVATAR_COLOR_KEY = "earnie_kid_avatar_color";

export function clearKidSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("earnie_char");
  localStorage.removeItem("earnie_kid_id");
  localStorage.removeItem("earnie_kid_name");
  localStorage.removeItem(KID_AVATAR_COLOR_KEY);
}

export function getKidIdFromRequest(request: Request): string | null {
  return request.headers.get(KID_ID_HEADER);
}

export function verifyKidSession(request: Request, kidId: string): boolean {
  return getKidIdFromRequest(request) === kidId;
}

export function kidSessionHeaders(kidId: string): HeadersInit {
  return { [KID_ID_HEADER]: kidId };
}
