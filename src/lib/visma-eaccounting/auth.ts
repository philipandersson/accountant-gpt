import { ENV } from "@/lib/env";
import { error, ok } from "@/lib/utils/result";
import { STATE } from "./client";
import { TokenSchema } from "./schema";

export async function exchangeCodeForToken(code?: string, state?: string) {
  if (!code || state !== STATE) {
    return error("Unauthorized: Code or State invalid");
  }

  const clientBuffer = Buffer.from(
    `${ENV.NEXT_PUBLIC_VISMA_EACCOUNTING_CLIENT_ID}:${ENV.VISMA_EACCOUNTING_CLIENT_SECRET}`,
    "utf-8"
  );
  const clientBase64 = clientBuffer.toString("base64");

  const formBody = Object.entries({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: ENV.NEXT_PUBLIC_VISMA_EACCOUNTING_REDIRECT_URI,
  })
    .map(
      ([key, value]) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(value)
    )
    .join("&");

  const response = await fetch(
    "https://identity.vismaonline.com/connect/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${clientBase64}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    }
  );

  if (!response.ok) {
    return error(response.statusText);
  }

  const rawTokenObject = await response.json();

  const tokenObject = TokenSchema.safeParse({
    ...rawTokenObject,
    scope: rawTokenObject?.scope?.split(" "),
  });

  if (!tokenObject.success) {
    return error(tokenObject.error.message);
  }

  return ok(tokenObject.data);
}
