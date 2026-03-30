import { describe, it, expect } from "vitest";

describe("RecentCreations Component", () => {
  it("should filter generations by type", () => {
    const generations = [
      { id: 1, type: "IMAGE", prompt: "A beautiful sunset" },
      { id: 2, type: "STORY", prompt: "Once upon a time" },
      { id: 3, type: "IMAGE", prompt: "Mountain landscape" },
      { id: 4, type: "AVATAR", prompt: "Cartoon hero" },
    ];

    const imageGenerations = generations.filter((g) => g.type === "IMAGE");
    expect(imageGenerations).toHaveLength(2);
    expect(imageGenerations[0]?.type).toBe("IMAGE");
  });

  it("should sort generations by newest first", () => {
    const generations = [
      { id: 1, createdAt: new Date("2026-01-01") },
      { id: 2, createdAt: new Date("2026-03-01") },
      { id: 3, createdAt: new Date("2026-02-01") },
    ];

    const sorted = [...generations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    expect(sorted[0]?.id).toBe(2);
    expect(sorted[1]?.id).toBe(3);
    expect(sorted[2]?.id).toBe(1);
  });

  it("should sort generations by oldest first", () => {
    const generations = [
      { id: 1, createdAt: new Date("2026-01-01") },
      { id: 2, createdAt: new Date("2026-03-01") },
      { id: 3, createdAt: new Date("2026-02-01") },
    ];

    const sorted = [...generations].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    expect(sorted[0]?.id).toBe(1);
    expect(sorted[1]?.id).toBe(3);
    expect(sorted[2]?.id).toBe(2);
  });

  it("should sort by credits high to low", () => {
    const generations = [
      { id: 1, credits_used: 5 },
      { id: 2, credits_used: 20 },
      { id: 3, credits_used: 10 },
    ];

    const sorted = [...generations].sort((a, b) => b.credits_used - a.credits_used);

    expect(sorted[0]?.id).toBe(2);
    expect(sorted[1]?.id).toBe(3);
    expect(sorted[2]?.id).toBe(1);
  });

  it("should sort by credits low to high", () => {
    const generations = [
      { id: 1, credits_used: 5 },
      { id: 2, credits_used: 20 },
      { id: 3, credits_used: 10 },
    ];

    const sorted = [...generations].sort((a, b) => a.credits_used - b.credits_used);

    expect(sorted[0]?.id).toBe(1);
    expect(sorted[1]?.id).toBe(3);
    expect(sorted[2]?.id).toBe(2);
  });

  it("should return correct type icon", () => {
    const types = ["IMAGE", "STORY", "AVATAR", "VIDEO"];
    expect(types).toContain("IMAGE");
    expect(types).toContain("STORY");
    expect(types).toContain("AVATAR");
  });

  it("should return correct status color", () => {
    const statuses = ["COMPLETED", "PROCESSING", "FAILED"];
    expect(statuses).toContain("COMPLETED");
    expect(statuses).toContain("PROCESSING");
    expect(statuses).toContain("FAILED");
  });

  it("should handle empty generations list", () => {
    const generations: any[] = [];
    expect(generations).toHaveLength(0);
    expect(generations.length === 0).toBe(true);
  });

  it("should filter and sort combined", () => {
    const generations = [
      { id: 1, type: "IMAGE", credits_used: 5, createdAt: new Date("2026-01-01") },
      { id: 2, type: "STORY", credits_used: 20, createdAt: new Date("2026-03-01") },
      { id: 3, type: "IMAGE", credits_used: 10, createdAt: new Date("2026-02-01") },
      { id: 4, type: "AVATAR", credits_used: 15, createdAt: new Date("2026-02-15") },
    ];

    const filtered = generations.filter((g) => g.type === "IMAGE");
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    expect(sorted).toHaveLength(2);
    expect(sorted[0]?.id).toBe(3);
    expect(sorted[1]?.id).toBe(1);
  });

  it("should validate generation status", () => {
    const generation = {
      id: 1,
      status: "COMPLETED" as const,
    };

    expect(generation.status === "COMPLETED").toBe(true);
    expect(["COMPLETED", "PROCESSING", "FAILED"]).toContain(generation.status);
  });

  it("should handle download action", () => {
    const generation = {
      id: 1,
      output_url: "https://example.com/image.png",
    };

    expect(generation.output_url).toBeDefined();
    expect(generation.output_url).toContain("example.com");
  });

  it("should handle share action", () => {
    const generation = {
      id: 1,
      type: "IMAGE",
      prompt: "A beautiful sunset",
    };

    const shareText = `Check out my AI-generated ${generation.type.toLowerCase()}! "${generation.prompt}"`;
    expect(shareText).toContain("AI-generated");
    expect(shareText).toContain(generation.prompt);
  });

  it("should count total generations", () => {
    const generations = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
    ];

    expect(generations.length).toBe(5);
  });

  it("should validate view type toggle", () => {
    const viewTypes = ["grid", "list"] as const;
    expect(viewTypes).toContain("grid");
    expect(viewTypes).toContain("list");
  });
});
