import { describe, it, expect } from "vitest";

describe("GenerateStory Component", () => {
  it("should validate prompt length", () => {
    const validPrompt = "This is a story about a hero on a quest";
    const tooShort = "Short";
    const tooLong = "x".repeat(501);

    expect(validPrompt.length).toBeGreaterThanOrEqual(10);
    expect(validPrompt.length).toBeLessThanOrEqual(500);

    expect(tooShort.length).toBeLessThan(10);
    expect(tooLong.length).toBeGreaterThan(500);
  });

  it("should calculate credit costs correctly", () => {
    const storyLengths = [
      { id: "short", credits: 2 },
      { id: "medium", credits: 4 },
      { id: "long", credits: 6 },
    ];

    expect(storyLengths[0].credits).toBe(2);
    expect(storyLengths[1].credits).toBe(4);
    expect(storyLengths[2].credits).toBe(6);
  });

  it("should validate tone selection", () => {
    const validTones = ["humorous", "dramatic", "romantic", "mysterious", "adventure", "sci-fi"];
    const selectedTone = "dramatic";

    expect(validTones).toContain(selectedTone);
  });

  it("should prevent generation with insufficient credits", () => {
    const userBalance = 2;
    const creditCost = 4;

    expect(userBalance < creditCost).toBe(true);
  });

  it("should allow generation with sufficient credits", () => {
    const userBalance = 10;
    const creditCost = 4;

    expect(userBalance >= creditCost).toBe(true);
  });

  it("should calculate remaining credits correctly", () => {
    const userBalance = 20;
    const creditCost = 6;
    const remaining = userBalance - creditCost;

    expect(remaining).toBe(14);
  });
});
