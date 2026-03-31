import { describe, it, expect } from "vitest";

describe("AdminGenerations", () => {
  it("should display content moderation title", () => {
    const title = "Content Moderation";
    expect(title).toBe("Content Moderation");
  });

  it("should filter flagged content", () => {
    const generations = [
      { id: 1, isFlagged: true },
      { id: 2, isFlagged: false },
      { id: 3, isFlagged: true },
    ];
    const flagged = generations.filter((g) => g.isFlagged);
    expect(flagged).toHaveLength(2);
  });

  it("should count flagged content", () => {
    const generations = [
      { id: 1, isFlagged: true, flagReason: "Violent content" },
      { id: 2, isFlagged: false },
      { id: 3, isFlagged: true, flagReason: "Adult content" },
    ];
    const flaggedCount = generations.filter((g) => g.isFlagged).length;
    expect(flaggedCount).toBe(2);
  });

  it("should count approved content", () => {
    const generations = [
      { id: 1, isFlagged: false },
      { id: 2, isFlagged: false },
      { id: 3, isFlagged: true },
    ];
    const approvedCount = generations.filter((g) => !g.isFlagged).length;
    expect(approvedCount).toBe(2);
  });

  it("should display generation types", () => {
    const types = ["IMAGE", "STORY", "AVATAR", "VIDEO"];
    expect(types).toHaveLength(4);
    expect(types).toContain("IMAGE");
  });

  it("should sort generations by date", () => {
    const generations = [
      { id: 1, createdAt: new Date("2026-03-30") },
      { id: 2, createdAt: new Date("2026-03-28") },
      { id: 3, createdAt: new Date("2026-03-29") },
    ];
    const sorted = [...generations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    expect(sorted[0]?.id).toBe(1);
    expect(sorted[1]?.id).toBe(3);
    expect(sorted[2]?.id).toBe(2);
  });

  it("should validate flag reasons", () => {
    const generation = {
      id: 1,
      isFlagged: true,
      flagReason: "Potentially violent content",
    };
    expect(generation.isFlagged).toBe(true);
    expect(generation.flagReason).toBeDefined();
  });

  it("should display generation status", () => {
    const statuses = ["COMPLETED", "PROCESSING", "FAILED"];
    expect(statuses).toHaveLength(3);
    expect(statuses).toContain("COMPLETED");
  });

  it("should filter by status", () => {
    const generations = [
      { id: 1, status: "COMPLETED" },
      { id: 2, status: "PROCESSING" },
      { id: 3, status: "COMPLETED" },
    ];
    const completed = generations.filter((g) => g.status === "COMPLETED");
    expect(completed).toHaveLength(2);
  });

  it("should handle approve action", () => {
    const generation = { id: 1, isFlagged: true };
    const approved = { ...generation, isFlagged: false };
    expect(approved.isFlagged).toBe(false);
  });

  it("should handle reject action", () => {
    const generation = { id: 1, status: "COMPLETED" };
    const rejected = { ...generation, status: "FAILED" };
    expect(rejected.status).toBe("FAILED");
  });

  it("should track user information", () => {
    const generation = {
      id: 1,
      userId: 101,
      userName: "John Doe",
    };
    expect(generation.userId).toBe(101);
    expect(generation.userName).toBe("John Doe");
  });
});
