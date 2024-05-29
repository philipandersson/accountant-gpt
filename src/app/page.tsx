"use client";
import { AccountingVoucher } from "@/components/accounting-voucher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadImageForm } from "@/components/upload-image-form";
import { useStream } from "@/components/use-stream";
import { Base64Image, partialInvoiceVoucherSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { LucideLoader, LucideSparkles } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

export default function Home() {
  const [step, setStep] = useState<"step1" | "step2" | "step3">("step1");
  const [images, setImages] = useState<Array<Base64Image>>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    retrieve,
    result: inoviceVoucher,
    isPending,
    error,
    reset,
  } = useStream({
    streamFn: async (images: Array<Base64Image>, signal) => {
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
        throw new Error("Failed to generate prediction");
      }

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.body.getReader();
    },
    resultSchema: partialInvoiceVoucherSchema,
    onSuccess: () => {
      console.log("Success");
      if (formRef.current) {
        formRef.current.reset();
      }
      setImages([]);
    },
  });

  const accountVoucherReady = Object.keys(inoviceVoucher).length > 0;
  const imagesUploaded = images.length > 0;

  function handleImagesUploaded(images: Array<Base64Image>) {
    setImages(images);
    reset();
  }

  function handleSubmit() {
    if (images.length < 1) {
      return;
    }

    retrieve(images);
    setStep("step2");
  }

  return (
    <main className="flex flex-col justify-center items-center p-8 w-full min-h-screen">
      <Tabs
        value={step}
        onValueChange={(value) => setStep(value as "step1" | "step2" | "step3")}
        className="max-w-2xl justify-center items-center"
      >
        <TabsList className="flex items-center justify-center gap-4 bg-transparent">
          <TabsTrigger
            value="step1"
            className="data-[state=active]:bg-transparent"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white dark:bg-gray-50 dark:text-gray-900">
                1
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Upload invoice/receipt
              </span>
            </div>
          </TabsTrigger>
          <div className="h-px w-12 bg-gray-200 dark:bg-gray-700" />
          <TabsTrigger
            value="step2"
            className="data-[state=active]:bg-transparent"
            disabled={!imagesUploaded}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white dark:bg-gray-50 dark:text-gray-900">
                2
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Suggestion
              </span>
            </div>
          </TabsTrigger>
          <div className="h-px w-12 bg-gray-200 dark:bg-gray-700" />
          <TabsTrigger
            value="step3"
            className="data-[state=active]:bg-transparent"
            disabled={!accountVoucherReady}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white dark:bg-gray-50 dark:text-gray-900">
                3
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Record
              </span>
            </div>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="step1">
          <Card className="w-full">
            <CardHeader>
              <h1 className="text-lg font-medium text-center">
                How do I account for my invoice or receipt?
              </h1>
            </CardHeader>
            <CardContent>
              <UploadImageForm
                onImagesUploaded={handleImagesUploaded}
                onSubmit={handleSubmit}
                ref={formRef}
              >
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
              </UploadImageForm>
              {images.length > 0 && (
                <div
                  className={cn(
                    "grid",
                    "gap-4",
                    "py-4",
                    images.length > 1 ? "grid-cols-2" : "grid-cols-1"
                  )}
                >
                  {images.map((image) => (
                    <div
                      key={image.name}
                      className="flex flex-col items-center justify-center"
                    >
                      <Image
                        src={`${image.type},${image.base64}`}
                        alt={image.name}
                        width={200}
                        height={200}
                        className="aspect-a4"
                      />
                      <Label className="mt-2">{image.name}</Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="step2">
          {error && <div className="text-red-500">{error.message}</div>}
          {<AccountingVoucher data={inoviceVoucher} isPending={isPending} />}
        </TabsContent>
      </Tabs>
    </main>
  );
}
