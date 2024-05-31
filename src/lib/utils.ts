import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRootUrl(urlObject: URL) {
  const protocol = urlObject.protocol;
  const hostname = urlObject.hostname;
  const port = urlObject.port ? `:${urlObject.port}` : "";

  return `${protocol}//${hostname}${port}`;
}
