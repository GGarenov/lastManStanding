import { describe, it, expect } from "vitest";
import { normalizeId, normalizeList } from "./client";

describe("normalizeId", () => {
  it("maps _id to id and removes _id", () => {
    const obj = { _id: "abc123", name: "Pool" };
    const result = normalizeId(obj);
    expect(result).toEqual({ name: "Pool", id: "abc123" });
    expect(result).not.toHaveProperty("_id");
  });

  it("keeps id when _id is absent but id present", () => {
    const obj = { id: "existing-id", name: "Pool" };
    const result = normalizeId(obj as { _id?: string; id: string; name: string });
    expect(result.id).toBe("existing-id");
    expect(result.name).toBe("Pool");
  });

  it("handles object with only _id", () => {
    const obj = { _id: "only" };
    const result = normalizeId(obj);
    expect(result).toEqual({ id: "only" });
  });
});

describe("normalizeList", () => {
  it("maps each item with normalizeId", () => {
    const list = [
      { _id: "id1", name: "A" },
      { _id: "id2", name: "B" },
    ];
    const result = normalizeList(list);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: "A", id: "id1" });
    expect(result[1]).toEqual({ name: "B", id: "id2" });
  });

  it("returns empty array for empty list", () => {
    expect(normalizeList([])).toEqual([]);
  });
});
