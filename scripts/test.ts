// import Instructor from "@instructor-ai/instructor";
// import "dotenv/config";
// import OpenAI from "openai";
// import { z } from "zod";

import { z } from "zod";

// const oai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY ?? undefined,
// });

// const client = Instructor({
//   client: oai,
//   mode: "TOOLS",
// });

// const UserSchema = z.object({
//   // Description will be used in the prompt
//   age: z.number().describe("The age of the user"),
//   name: z.string(),
// });

// (async () => {
//   // User will be of type z.infer<typeof UserSchema>
//   const user = await client.chat.completions.create({
//     messages: [{ role: "user", content: "Jason Liu is 30 years old" }],
//     model: "gpt-3.5-turbo",
//     response_model: {
//       schema: UserSchema,
//       name: "User",
//     },
//   });
//   console.log(user);
// })();

const myType = z.coerce.date();

console.log(myType.safeParse("2023-01-01"));
console.log(myType.safeParse("2024-05-01T04:08:45"));
