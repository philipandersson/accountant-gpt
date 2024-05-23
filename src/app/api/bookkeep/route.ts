import { z } from "zod";

const bodySchema = z.object({
  imageFile: z
    .instanceof(File)
    .refine(
      (file) =>
        z.enum(["image/png", "image/jpeg", "image/webp"]).safeParse(file.type)
          .success
    ),
});

export async function POST(request: Request) {
  const formData = await request.formData();
  const invoiceFile = formData.get("file");

  const { success, data, error } = bodySchema.safeParse({ invoiceFile });

  if (!success) {
    return Response.json({ error: error.message, ok: false }, { status: 400 });
  }

  console.log("FILE", data.imageFile, await data.imageFile.arrayBuffer());

  return Response.json({ invoiceFile: invoiceFile });
}
