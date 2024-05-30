import { predictInvoiceVoucher } from "@/lib/invoice-voucher/predict";
import { createPartialObjectStream } from "@/lib/llm/create-partial-object-stream";
import { logger } from "@/lib/logger";
import { bodySchema } from "@/lib/schemas";
import { isString } from "lodash";
import { InvoiceVoucher } from "../../../lib/schemas";

export const maxDuration = 60;

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

  const llmGenerator = await predictInvoiceVoucher({
    prompt:
      isString(data.prompt) && data.prompt.trim().length > 0
        ? data.prompt
        : null,
    images: data.images,
  });

  logger.info({ llmGenerator }, "LLM response");

  return new Response(createPartialObjectStream<InvoiceVoucher>(llmGenerator));
}
