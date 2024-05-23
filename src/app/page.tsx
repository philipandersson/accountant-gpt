"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { LucideSparkles } from "lucide-react";
import { useState } from "react";

import { convertPageToPng } from "@/lib/pdf/convertPageToPng";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const { isPending, mutate } = useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await fetch("/api/bookkeep", {
          method: "POST",
          body: formData,
        });
        if (response.ok) {
          console.log("File uploaded successfully");
        } else {
          console.error("File upload failed");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    console.log(file);

    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const pngPromises: Promise<string>[] = [];
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        pngPromises.push(convertPageToPng(pdf, pageNum));
      }

      const pngUrls = await Promise.all(pngPromises);
      console.log(pngUrls);
      // setPngUrls(pngUrls);
    } else {
      setFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(e);

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    mutate(formData);

    console.log("File uploaded successfully");

    setFile(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <form
        className="flex flex-col items-center justify-center gap-2 h-screen"
        onSubmit={handleSubmit}
      >
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="inoviceFile">Invoice or Receipt (PDF or Image)</Label>
          <Input
            name="file"
            id="file"
            type="file"
            accept="image/*, .pdf"
            onChange={handleFileChange}
          />
        </div>
        <Button type="submit" className="w-full" disabled={!file || isPending}>
          <LucideSparkles className="mr-2 w-4 h-4" />
          Bookkeep
        </Button>
      </form>
    </main>
  );
}
