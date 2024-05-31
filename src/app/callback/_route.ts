import { getRootUrl } from "@/lib/utils";
import { exchangeCodeForToken } from "@/lib/visma-eaccounting/auth";
import { kv } from "@vercel/kv";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return new Response("Unauthorized: Code or State invalid", { status: 401 });
  }

  const tokenData = await exchangeCodeForToken(code, state);

  if (!tokenData.ok) {
    return new Response(tokenData.error, { status: 401 });
  }

  await kv.hset("token", tokenData.data);

  return Response.redirect(getRootUrl(url));
}
