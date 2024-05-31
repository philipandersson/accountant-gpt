import { ENV } from "@/lib/env";
import { getRootUrl } from "@/lib/utils";
import { REDIRECT_URI, STATE } from "@/lib/visma-eaccounting/client";
import { kv } from "@vercel/kv";
import { TokenSchema } from "../../lib/visma-eaccounting/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || state !== STATE) {
    return new Response("Unauthorized: Code or State invalid", { status: 401 });
  }

  const clientBuffer = Buffer.from(
    `${ENV.NEXT_PUBLIC_VISMA_EACCOUNTING_CLIENT_ID}:${ENV.VISMA_EACCOUNTING_CLIENT_SECRET}`,
    "utf-8"
  );
  const clientBase64 = clientBuffer.toString("base64");

  const formBody = Object.entries({
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
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
    return new Response(`Unauthorized: ${response.statusText}`, {
      status: 401,
    });
  }

  const rawTokenData = await response.json();

  const tokenData = TokenSchema.parse({
    ...rawTokenData,
    scope: rawTokenData.scope.split(" "),
  });

  await kv.hset("token", tokenData);

  return Response.redirect(getRootUrl(url));
}
