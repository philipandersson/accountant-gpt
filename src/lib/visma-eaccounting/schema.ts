import { z } from "zod";

export const TokenScopeSchema = z.enum([
  "ea:api",
  "ea:sales",
  "ea:purchase",
  "ea:accounting",
  "offline_access",
]);

export type TokenScope = z.infer<typeof TokenScopeSchema>;

export const TokenScopeEnum = TokenScopeSchema.enum;

export const TokenSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  refresh_token: z.string(),
  scope: z.array(TokenScopeSchema),
});
