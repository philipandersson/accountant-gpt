import { z } from "zod";

function parseJsonLine<T>(line: string): T {
  try {
    return JSON.parse(line.trim()) as T;
  } catch (error) {
    throw new Error(`Failed to parse JSON line: ${line}`, { cause: error });
  }
}

export async function* decodePartialObjectStream<T>(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  schema: z.ZodSchema<Partial<T>>
): AsyncGenerator<Partial<T>> {
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const decoded = decoder.decode(value, { stream: true });
    const lines = decoded.split("\n").filter(Boolean);

    for (const line of lines) {
      const json = schema.safeParse(parseJsonLine<Partial<T>>(line));

      if (!json.success) {
        console.error(JSON.stringify(json.error));
      } else {
        yield json.data;
      }
    }
  }
}
