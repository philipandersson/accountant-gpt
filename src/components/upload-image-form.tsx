"use client";

import { convertPageToPng } from "@/lib/pdf/convertPageToPng";
import { Base64Image } from "@/lib/schemas";
import * as pdfjsLib from "pdfjs-dist";
import { forwardRef, useCallback, useRef } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface UploadImageFormProps {
  children: React.ReactNode;
  onImagesUploaded: (images: Array<Base64Image>) => void;
  onPromptChanged: (prompt: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const UploadImageForm = forwardRef<
  HTMLFormElement,
  UploadImageFormProps
>(function UploadImageForm(
  { children, onImagesUploaded, onPromptChanged, onSubmit },
  ref
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [fileInputRef]);

  async function handlePromptChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    onPromptChanged(event.target.value);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
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

      onImagesUploaded(convertedImages);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Url = reader.result as string;
        const [type, base64] = base64Url.split(",");

        onImagesUploaded([
          {
            name: currentFile.name,
            base64,
            type,
          },
        ]);
      };
      reader.readAsDataURL(currentFile);
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      ref={ref}
      onReset={handleReset}
    >
      <div className="flex flex-col w-full gap-2">
        <Label htmlFor="inoviceFile">What are you recording? (Optional)</Label>
        <Input
          name="prompt"
          id="prompt"
          type="text"
          onChange={handlePromptChange}
        />
      </div>
      <div className="flex flex-col w-full gap-2">
        <Label htmlFor="inoviceFile">
          Upload invoice or receipt (PDF or Image)
          <span className="text-red-500">*</span>
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
      {children}
    </form>
  );
});
