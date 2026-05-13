import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";

describe("useIsMobile", () => {
  it("returns a boolean", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe("boolean");
  });

  it("returns true when window.innerWidth is below mobile breakpoint (768)", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 500,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false when window.innerWidth is at or above 768", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 768,
      writable: true,
      configurable: true,
    });
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});
