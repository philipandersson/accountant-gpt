"use client";
import AccountingVoucher from "@/components/accounting-voucher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { convertPageToPng } from "@/lib/pdf/convertPageToPng";
import { Base64Image } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { LucideLoader, LucideSparkles } from "lucide-react";
import Image from "next/image";
import * as pdfjsLib from "pdfjs-dist";
import { useRef, useState } from "react";
import { invoiceVoucherSchema } from "../lib/schemas";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<Array<Base64Image>>([]);

  const {
    isPending,
    mutate,
    data: inoviceVoucher,
    reset: resetInvoiceVoucher,
  } = useMutation({
    mutationFn: async (images: Array<Base64Image>) => {
      try {
        const response = await fetch("/api/bookkeep", {
          method: "POST",
          body: JSON.stringify({
            images,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("File upload failed");
        }

        const json = await response.json();

        console.log(json);

        return invoiceVoucherSchema.parse(json);
      } catch (error) {
        console.error("Error:", error);
      }
    },
    onSuccess: () => {
      console.log("Images uploaded successfully");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setImages([]);
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const currentFile = event.target.files?.[0] ?? "";

    if (!currentFile) {
      return;
    }

    const [filename] = currentFile.name.split(".");

    if (currentFile.type === "application/pdf") {
      const arrayBuffer = await currentFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const convertedImages = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, i) => {
          const base64Url = await convertPageToPng(pdf, i + 1);
          const [type, base64] = base64Url.split(",");

          return {
            name: `${filename}-page-${i + 1}.png`,
            base64,
            type,
          };
        })
      );

      console.log(convertedImages);

      setImages(convertedImages);
      resetInvoiceVoucher();
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        const [type, base64] = base64Url.split(",");

        setImages([
          {
            name: currentFile.name,
            base64,
            type,
          },
        ]);
      };
      reader.readAsDataURL(currentFile);
    }

    console.log(currentFile, images);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (images.length < 1) {
      return;
    }

    mutate(images);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-4">
      <h1 className="text-2xl">How do I account for my invoice or receipt?</h1>
      {inoviceVoucher && <AccountingVoucher {...inoviceVoucher} />}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4"
      >
        <div className="grid w-full max-w-sm items-center gap-2">
          <Label htmlFor="inoviceFile">
            Upload invoice or Receipt (PDF or Image)
          </Label>
          <Input
            name="file"
            id="file"
            type="file"
            accept="image/*, .pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>
        {images.length > 0 && (
          <div
            className={cn(
              "grid",
              "gap-4",
              images.length > 1 ? "grid-cols-2" : "grid-cols-1"
            )}
          >
            {images.map((image) => (
              <div
                key={image.name}
                className="flex flex-col items-center justify-center aspect-a4"
              >
                <Image
                  src={`${image.type},${image.base64}`}
                  alt={image.name}
                  width={200}
                  height={200}
                />
                <Label className="mt-2">{image.name}</Label>
              </div>
            ))}
          </div>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={images.length < 1 || isPending}
        >
          {isPending ? (
            <LucideLoader className="animate-spin w-4 h-4" />
          ) : (
            <LucideSparkles className="w-4 h-4" />
          )}
          <span className="ml-2">Record suggestion</span>
        </Button>
      </form>
    </main>
  );
}
