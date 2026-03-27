import { describe, it, expect } from "vitest";
import { cn } from "@utils/cn";

describe("cn — class name utility", () => {
  it("merges simple class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", true && "active", false && "hidden")).toBe("base active");
  });

  it("deduplicates conflicting Tailwind classes", () => {
    expect(cn("px-4", "px-8")).toBe("px-8");
  });

  it("handles undefined and null", () => {
    expect(cn("base", undefined, null, "extra")).toBe("base extra");
  });

  it("handles empty strings", () => {
    expect(cn("", "a", "", "b")).toBe("a b");
  });

  it("handles arrays", () => {
    expect(cn(["a", "b"])).toBe("a b");
  });

  it("merges bg- variants correctly", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("merges text- variants correctly", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});
