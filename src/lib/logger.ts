import Pino from "pino";
import pkg from "../../package.json";

const pino = Pino({
  level: process.env.LOG_LEVEL ?? "info",
});

export const logger = pino.child({ app: pkg.name });
