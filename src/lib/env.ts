import "dotenv/config";
import { z } from "zod";

export const ENV = z
  .object({
    OPENAI_API_KEY: z.string(),
  })
  .parse(process.env);
