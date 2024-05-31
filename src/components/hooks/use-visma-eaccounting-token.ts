import { Token, TokenSchema } from "@/lib/visma-eaccounting/schema";
import { useEffect, useState } from "react";

export function useVismaEaccountingToken() {
  const [token, setToken] = useState<Token | null>(null);

  useEffect(() => {
    const getToken = () => {
      try {
        const rawToken = TokenSchema.safeParse(
          JSON.parse(localStorage.getItem("token") ?? "{}")
        );
        setToken(rawToken.success ? rawToken.data : null);
      } catch (error) {
        console.error("Failed to parse token:", error);
        setToken(null);
      }
    };

    getToken();

    const handleStorageChange = () => getToken();

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return token;
}
