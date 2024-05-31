"use client";

import { useVismaEaccountingToken } from "@/components/hooks/use-visma-eaccounting-token";
import Main from "@/components/main";
import { Button } from "@/components/ui/button";
import { generateSignInUrl } from "@/lib/visma-eaccounting/generate-sign-in-url";
import Link from "next/link";

export default function Home() {
  const token = useVismaEaccountingToken();

  return (
    <main className="flex flex-col justify-center items-center p-8 w-full min-h-screen">
      {!token && (
        <Button asChild>
          <Link
            href={generateSignInUrl(
              process.env.NEXT_PUBLIC_VISMA_EACCOUNTING_CLIENT_ID ?? "",
              process.env.NEXT_PUBLIC_VISMA_EACCOUNTING_REDIRECT_URI ?? ""
            )}
          >
            Login
          </Link>
        </Button>
      )}
      <Main />
    </main>
  );
}
