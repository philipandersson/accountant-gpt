import { openai } from "./openai";
import Instructor from "@instructor-ai/instructor";

export const llm = Instructor({
  client: openai,
  mode: "FUNCTIONS",
});
