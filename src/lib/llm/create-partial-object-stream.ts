export function createPartialObjectStream<T>(
  generator: AsyncGenerator<Partial<T>>
) {
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of generator) {
        const data = encoder.encode(`${JSON.stringify(chunk)}\n`);
        controller.enqueue(data);
      }
      controller.close();
    },
  });
}
