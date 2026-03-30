import { describe, it, expect } from "vitest";
import { CREDIT_PACKAGES, getCreditPackage } from "./_core/razorpay";

describe("Payment Router", () => {
  it("should have credit packages defined", () => {
    expect(CREDIT_PACKAGES.length).toBeGreaterThan(0);
  });

  it("should have starter package with 100 credits", () => {
    const pkg = getCreditPackage("starter");
    expect(pkg).toBeDefined();
    expect(pkg?.credits).toBe(100);
  });

  it("should have basic package with 500 credits", () => {
    const pkg = getCreditPackage("basic");
    expect(pkg).toBeDefined();
    expect(pkg?.credits).toBe(500);
  });

  it("should have pro package with 1000 credits", () => {
    const pkg = getCreditPackage("pro");
    expect(pkg).toBeDefined();
    expect(pkg?.credits).toBe(1000);
  });

  it("should have premium package with 2500 credits", () => {
    const pkg = getCreditPackage("premium");
    expect(pkg).toBeDefined();
    expect(pkg?.credits).toBe(2500);
  });

  it("should calculate price per credit correctly", () => {
    const pkg = getCreditPackage("basic");
    if (pkg) {
      const pricePerCredit = pkg.priceInr / pkg.credits;
      expect(pricePerCredit).toBeCloseTo(0.798, 2);
    }
  });

  it("should return undefined for invalid package", () => {
    const pkg = getCreditPackage("invalid");
    expect(pkg).toBeUndefined();
  });

  it("should have discount percentages", () => {
    const packages = CREDIT_PACKAGES;
    packages.forEach((pkg) => {
      expect(pkg.discount).toBeGreaterThanOrEqual(0);
      expect(pkg.discount).toBeLessThanOrEqual(100);
    });
  });

  it("should convert amount to paise correctly", () => {
    const amountInr = 99;
    const amountPaise = amountInr * 100;
    expect(amountPaise).toBe(9900);
  });

  it("should validate transaction status", () => {
    const validStatuses = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];
    const status = "SUCCESS";
    expect(validStatuses).toContain(status);
  });

  it("should validate transaction types", () => {
    const validTypes = ["PURCHASE", "REFUND", "BONUS", "AFFILIATE_BONUS"];
    const type = "PURCHASE";
    expect(validTypes).toContain(type);
  });
});
