import { decodePartialObjectStream } from "@/lib/llm/decode-partial-object-stream";
import { Base64Image } from "@/lib/schemas";
import { useCallback, useState } from "react";
import { z } from "zod";

async function startStream(images: Array<Base64Image>, signal: AbortSignal) {
  const response = await fetch("/api/bookkeep", {
    method: "POST",
    body: JSON.stringify({
      images,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    signal,
  });

  if (!response.body) {
    throw new Error("Failed to retrieve");
  }

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.body.getReader();
}

export function useStream<T>(resultSchema: z.ZodSchema<Partial<T>>) {
  const [result, setResult] = useState<Partial<T>>({});
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [abortController] = useState(new AbortController());

  const retrieve = useCallback(
    async (images: Array<Base64Image>) => {
      try {
        setIsPending(true);
        setError(null);
        setResult({});

        const stream = await startStream(images, abortController.signal);

        for await (const part of decodePartialObjectStream<T>(
          stream,
          resultSchema
        )) {
          setResult(part);
        }
      } catch (thrown) {
        console.error("Error in retrieve stream", thrown);
        abortController.abort(thrown);
        if (thrown instanceof Error) {
          setError(thrown);
        } else {
          setError(new Error("Unknown error"));
        }
      } finally {
        setIsPending(false);
      }
    },
    [resultSchema, abortController]
  );

  const reset = useCallback(() => {
    setError(null);
    setIsPending(false);
    setResult({});
  }, []);

  return {
    result,
    isPending,
    error,
    retrieve,
    reset,
  };
}
