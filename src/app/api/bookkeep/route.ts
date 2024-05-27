import { predictInvoiceVoucher } from "@/lib/invoice-voucher/predict";
import { createPartialObjectStream } from "@/lib/llm/create-partial-object-stream";
import { logger } from "@/lib/logger";
import { bodySchema } from "@/lib/schemas";
import { InvoiceVoucher } from "../../../lib/schemas";

export async function POST(request: Request) {
  const { success, data, error } = bodySchema.safeParse(await request.json());

  if (!success) {
    return Response.json({ error: error.message, ok: false }, { status: 400 });
  }

  data.images.forEach((image) => {
    logger.info("Image to be predicted", {
      name: image.name,
      base64Preix: image.base64.slice(0, 10),
      type: image.type,
    });
  });

  const llmGenerator = await predictInvoiceVoucher(data.images);

  logger.info({ llmGenerator }, "LLM response");

  return new Response(createPartialObjectStream<InvoiceVoucher>(llmGenerator));
}
