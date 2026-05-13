import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("returns single class string as-is", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes (truthy)", () => {
    expect(cn("base", true && "active")).toBe("base active");
  });

  it("handles conditional classes (falsy)", () => {
    expect(cn("base", false && "active")).toBe("base");
  });

  it("tailwind merge: later conflicting class wins", () => {
    // tailwind-merge: px-2 and px-4 conflict, last wins
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles undefined and null", () => {
    expect(cn("a", undefined, "b", null)).toBe("a b");
  });

  it("handles array of classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});
