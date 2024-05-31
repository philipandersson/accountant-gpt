import { TokenScope } from "./schema";

export const SCOPES: TokenScope[] = [
  "ea:api",
  "ea:sales",
  "ea:purchase",
  "ea:accounting",
  "offline_access",
];

// TODO: Make dynamic per request
export const STATE = "a1b2c3d4e5f6g7h8i9j0";
