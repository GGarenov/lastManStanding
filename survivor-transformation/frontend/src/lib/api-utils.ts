import { AxiosError } from "axios";

/**
 * Extract a user-facing error message from an unknown thrown value.
 * Handles AxiosError (response.data.message as string or string[]), generic Error, or fallback.
 */
export function getApiErrorMessage(e: unknown, fallback: string): string {
  if (e instanceof AxiosError && e.response?.data) {
    const data = e.response.data as { message?: string | string[] };
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(", ");
  }
  return e instanceof Error ? e.message : fallback;
}
