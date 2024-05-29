import { decodePartialObjectStream } from "@/lib/llm/decode-partial-object-stream";
import { useCallback, useState } from "react";
import { z } from "zod";

export function useStream<T, TVariables>({
  streamFn,
  resultSchema,
  onSuccess,
}: {
  streamFn: (
    variables: TVariables,
    signal: AbortSignal
  ) => Promise<ReadableStreamDefaultReader<Uint8Array>>;
  resultSchema: z.ZodSchema<Partial<T>>;
  onSuccess: (result: T) => void;
}) {
  const [result, setResult] = useState<Partial<T>>({});
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const [abortController] = useState(new AbortController());

  const reset = useCallback(() => {
    setError(null);
    setIsPending(false);
    setResult({});
  }, []);

  const retrieve = useCallback(
    async (variables: TVariables) => {
      try {
        setIsPending(true);
        setError(null);
        setResult({});

        const stream = await streamFn(variables, abortController.signal);

        let _result: T | undefined;

        for await (const part of decodePartialObjectStream<T>(
          stream,
          resultSchema
        )) {
          setResult(part);
          _result = part as T;
        }

        if (_result) {
          onSuccess(_result);
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
    [resultSchema, abortController, onSuccess, streamFn]
  );

  return {
    result,
    isPending,
    onSuccess,
    error,
    retrieve,
    reset,
  };
}
