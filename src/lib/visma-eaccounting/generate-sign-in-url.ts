import { SCOPES, STATE } from "./client";

export function generateSignInUrl(clientId: string, redirectUri: string) {
  const url = new URL("https://identity.vismaonline.com/connect/authorize");

  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("scope", SCOPES.join(" "));
  url.searchParams.append("state", STATE);
  url.searchParams.append("response_type", "code");
  url.searchParams.append("prompt", "select_account");
  url.searchParams.append("acr_values", "forceselectcompany:true");

  return url.toString();
}
