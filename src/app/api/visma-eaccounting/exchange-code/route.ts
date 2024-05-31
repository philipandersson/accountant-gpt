import { exchangeCodeForToken } from "@/lib/visma-eaccounting/auth";
import { z } from "zod";

const bodySchema = z.object({
  code: z.string(),
  state: z.string(),
});

export async function POST(request: Request) {
  const { error, data } = bodySchema.safeParse(await request.json());

  if (error) {
    return new Response(error.message, { status: 400 });
  }

  const { code, state } = data;

  const tokenData = await exchangeCodeForToken(code, state);

  if (!tokenData.ok) {
    return new Response(tokenData.error, { status: 401 });
  }

  return new Response(JSON.stringify(tokenData.data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
