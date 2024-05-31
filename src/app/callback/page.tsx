"use client";

import { useQuery } from "@tanstack/react-query";
import { isString } from "lodash";
import { LucideLoader } from "lucide-react";
import { redirect } from "next/navigation";
import { TokenSchema } from "../../lib/visma-eaccounting/schema";

export default function VismaEaccountingCallbackPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { code, state } = searchParams;

  const { isPending, data } = useQuery({
    queryFn: async () => {
      if (!isString(code) || !isString(state)) {
        return redirect("/");
      }

      const response = await fetch("/api/visma-eaccounting/exchange-code", {
        method: "POST",
        body: JSON.stringify({ code, state }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return TokenSchema.parse(await response.json());
    },
    queryKey: ["visma-eaccounting", code, state],
  });

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-4xl font-bold">
            Fetching token from Visma Eaccounting
            <LucideLoader className="animate-spin w-8 h-8" />
          </div>
        </div>
      </div>
    );
  }

  localStorage.setItem("token", JSON.stringify(data));

  return redirect("/");
}
