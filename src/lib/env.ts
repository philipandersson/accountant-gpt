import "dotenv/config";
import { z } from "zod";

export const ENV = z
  .object({
    OPENAI_API_KEY: z.string(),
    NEXT_PUBLIC_VISMA_EACCOUNTING_CLIENT_ID: z.string(),
    NEXT_PUBLIC_VISMA_EACCOUNTING_REDIRECT_URI: z.string(),
    VISMA_EACCOUNTING_CLIENT_SECRET: z.string(),
    KV_REST_API_READ_ONLY_TOKEN: z.string(),
    KV_REST_API_TOKEN: z.string(),
    KV_REST_API_URL: z.string(),
    KV_URL: z.string(),
  })
  .parse(process.env);
