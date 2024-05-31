import { TokenScope } from "./schema";

const SCOPES: TokenScope[] = [
  "ea:api",
  "ea:sales",
  "ea:purchase",
  "ea:accounting",
  "offline_access",
];

export const REDIRECT_URI = "https://localhost:44300/callback";

export const STATE = "state";

export function generateSignInUrl(clientId: string) {
  const url = new URL("https://identity.vismaonline.com/connect/authorize");

  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", REDIRECT_URI);
  url.searchParams.append("scope", SCOPES.join(" "));
  url.searchParams.append("state", STATE);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("prompt", "select_account");
  url.searchParams.append("acr_values", "forceselectcompany:true");

  return url.toString();
}
