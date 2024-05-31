"use client";

import { AccountingVoucher } from "@/components/accounting-voucher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordSuggestionForm } from "@/components/upload-image-form";
import { useStream } from "@/components/use-stream";
import { Base64Image, partialInvoiceVoucherSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { LucideLoader, LucideSparkles } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useVismaEaccountingToken } from "./hooks/use-visma-eaccounting-token";

export default function Main({ children }: { children?: React.ReactNode }) {
  const [step, setStep] = useState<"step1" | "step2" | "step3">("step1");
  const [images, setImages] = useState<Array<Base64Image>>([]);
  const [prompt, setPrompt] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const token = useVismaEaccountingToken();

  const invoiceVoucherStream = useStream({
    streamFn: async (images: Array<Base64Image>, signal) => {
      const response = await fetch("/api/bookkeep", {
        method: "POST",
        body: JSON.stringify({
          images,
          prompt,
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

  const accountVoucherReady =
    Object.keys(invoiceVoucherStream.result).length > 0;

  function handleImagesUploaded(images: Array<Base64Image>) {
    setImages(images);
    invoiceVoucherStream.reset();
  }

  function handlePromptChanged(prompt: string) {
    setPrompt(prompt);
  }

  function handleSuggestionFormSubmit() {
    if (images.length < 1) {
      return;
    }

    invoiceVoucherStream.retrieve(images);
    setStep("step2");
  }

  const recordMutation = useMutation({
    mutationFn: async (images: Array<Base64Image>) => {},
    onSuccess: () => {
      console.log("Success");
      if (formRef.current) {
        formRef.current.reset();
      }
      setImages([]);
    },
  });

  function handleRecordButtonClick() {
    recordMutation.mutate(images);
  }

  return (
    <Tabs
      value={step}
      onValueChange={(value) => setStep(value as "step1" | "step2" | "step3")}
      className="max-w-2xl justify-center items-center"
    >
      <TabsList className="flex items-center justify-center gap-4 pb-8 bg-transparent">
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
          disabled={invoiceVoucherStream.isPending || !accountVoucherReady}
        >
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white dark:bg-gray-50 dark:text-gray-900">
              2
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Suggested record
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
              Voucher recorded
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
            <RecordSuggestionForm
              onImagesUploaded={handleImagesUploaded}
              onPromptChanged={handlePromptChanged}
              onSubmit={handleSuggestionFormSubmit}
              ref={formRef}
            >
              <Button
                type="submit"
                className="w-full"
                disabled={images.length < 1 || invoiceVoucherStream.isPending}
              >
                {invoiceVoucherStream.isPending ? (
                  <LucideLoader className="animate-spin w-4 h-4" />
                ) : (
                  <LucideSparkles className="w-4 h-4" />
                )}
                <span className="ml-2">Create suggestion</span>
              </Button>
            </RecordSuggestionForm>
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
        {invoiceVoucherStream.error && (
          <div className="text-red-500">
            {invoiceVoucherStream.error.message}
          </div>
        )}
        {
          <AccountingVoucher
            data={invoiceVoucherStream.result}
            isPending={invoiceVoucherStream.isPending}
          />
        }
        <Button
          disabled={!accountVoucherReady || invoiceVoucherStream.isPending}
          onClick={() => setStep("step3")}
        >
          Record
        </Button>
      </TabsContent>
      <TabsContent value="step3"></TabsContent>
    </Tabs>
  );
}
