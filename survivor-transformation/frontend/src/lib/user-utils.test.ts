import { describe, it, expect } from "vitest";
import {
  getUserDisplayName,
  getAvatarInitials,
  getAvatarColor,
} from "./user-utils";

describe("getUserDisplayName", () => {
  it("returns 'Guest' for null", () => {
    expect(getUserDisplayName(null)).toBe("Guest");
  });

  it("returns 'Guest' for undefined", () => {
    expect(getUserDisplayName(undefined)).toBe("Guest");
  });

  it("returns username when set", () => {
    expect(getUserDisplayName({ username: "alice", email: "a@b.com" })).toBe(
      "alice"
    );
  });

  it("returns email prefix when only email", () => {
    expect(getUserDisplayName({ email: "bob@example.com" })).toBe("bob");
  });

  it("returns 'User' when user has no username and no email", () => {
    expect(getUserDisplayName({})).toBe("User");
  });
});

describe("getAvatarInitials", () => {
  it("returns 'G' for null", () => {
    expect(getAvatarInitials(null)).toBe("G");
  });

  it("returns 'G' for undefined", () => {
    expect(getAvatarInitials(undefined)).toBe("G");
  });

  it("returns first 2 chars for single word (username)", () => {
    expect(getAvatarInitials({ username: "Alice" })).toBe("AL");
  });

  it("returns first letter of each for two words", () => {
    expect(getAvatarInitials({ username: "John Doe" })).toBe("JD");
  });

  it("uses email when username not set", () => {
    // email "xy@z.com" is split on [\s._-] so "xy@z", "com" -> first letter of each = "XC"
    expect(getAvatarInitials({ email: "xy@z.com" })).toBe("XC");
  });

  it("returns 'U' when user has no username and no email", () => {
    expect(getAvatarInitials({})).toBe("U");
  });

  it("handles separator (underscore) for two parts", () => {
    expect(getAvatarInitials({ username: "john_doe" })).toBe("JD");
  });
});

describe("getAvatarColor", () => {
  it("returns default for null", () => {
    expect(getAvatarColor(null)).toBe("bg-primary/20");
  });

  it("returns default for undefined", () => {
    expect(getAvatarColor(undefined)).toBe("bg-primary/20");
  });

  it("returns same color for same user (consistency)", () => {
    const user = { username: "testuser" };
    expect(getAvatarColor(user)).toBe(getAvatarColor(user));
  });

  it("returns hsl format", () => {
    const color = getAvatarColor({ username: "alice" });
    expect(color).toMatch(/^hsl\(\d+, 70%, 50%\)$/);
  });
});
