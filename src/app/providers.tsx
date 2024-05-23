"use client";

// import posthog from "posthog-js";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

// if (typeof window !== "undefined") {
//   posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
//     api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
//     capture_pageview: false, // Disable automatic pageview capture, as we capture manually
//   });
// }

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    // <SessionProvider>
    //   <PostHogProvider>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    //   </PostHogProvider>
    // </SessionProvider>
  );
}
