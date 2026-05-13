import { describe, it, expect } from "vitest";
import { AxiosError } from "axios";
import { getApiErrorMessage } from "./api-utils";

function createAxiosError(data: { message?: string | string[] }): AxiosError {
  const err = new AxiosError(
    "Request failed",
    undefined,
    undefined,
    undefined,
    {
      data,
      status: 400,
      statusText: "Bad Request",
      headers: {},
      config: {} as never,
    }
  );
  return err;
}

describe("getApiErrorMessage", () => {
  it("returns response.data.message when AxiosError has message as string", () => {
    const err = createAxiosError({ message: "Server said no" });
    expect(getApiErrorMessage(err, "Fallback")).toBe("Server said no");
  });

  it("returns joined string when AxiosError has message as string[]", () => {
    const err = createAxiosError({
      message: ["Name is required", "Email is invalid"],
    });
    expect(getApiErrorMessage(err, "Fallback")).toBe(
      "Name is required, Email is invalid"
    );
  });

  it("returns error.message when AxiosError has response.data but no message", () => {
    const err = createAxiosError({});
    expect(getApiErrorMessage(err, "Fallback")).toBe("Request failed");
  });

  it("returns error.message for generic Error", () => {
    const err = new Error("Something broke");
    expect(getApiErrorMessage(err, "Fallback")).toBe("Something broke");
  });

  it("returns fallback for non-Error thrown value (string)", () => {
    expect(getApiErrorMessage("oops", "Fallback")).toBe("Fallback");
  });

  it("returns fallback for non-Error thrown value (number)", () => {
    expect(getApiErrorMessage(42, "Fallback")).toBe("Fallback");
  });

  it("returns fallback when first arg is null", () => {
    expect(getApiErrorMessage(null, "Fallback")).toBe("Fallback");
  });

  it("returns fallback when first arg is undefined", () => {
    expect(getApiErrorMessage(undefined, "Fallback")).toBe("Fallback");
  });
});
