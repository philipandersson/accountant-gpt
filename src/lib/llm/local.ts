import OpenAI from "openai";

export const localLlm = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", // required but unused
});
