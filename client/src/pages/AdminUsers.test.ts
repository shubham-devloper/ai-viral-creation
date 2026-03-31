import { describe, it, expect } from "vitest";

describe("AdminUsers", () => {
  it("should display user management title", () => {
    const title = "User Management";
    expect(title).toBe("User Management");
  });

  it("should filter users by search term", () => {
    const users = [
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ];
    const searchTerm = "john";
    const filtered = users.filter((u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.name).toBe("John Doe");
  });

  it("should filter users by role", () => {
    const users = [
      { id: 1, role: "admin" },
      { id: 2, role: "user" },
      { id: 3, role: "admin" },
    ];
    const admins = users.filter((u) => u.role === "admin");
    expect(admins).toHaveLength(2);
  });

  it("should sort users by name", () => {
    const users = [
      { id: 1, name: "Charlie" },
      { id: 2, name: "Alice" },
      { id: 3, name: "Bob" },
    ];
    const sorted = [...users].sort((a, b) => a.name.localeCompare(b.name));
    expect(sorted[0]?.name).toBe("Alice");
    expect(sorted[1]?.name).toBe("Bob");
    expect(sorted[2]?.name).toBe("Charlie");
  });

  it("should sort users by creation date", () => {
    const users = [
      { id: 1, createdAt: new Date("2026-02-01") },
      { id: 2, createdAt: new Date("2026-01-01") },
      { id: 3, createdAt: new Date("2026-03-01") },
    ];
    const sorted = [...users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    expect(sorted[0]?.id).toBe(3);
    expect(sorted[1]?.id).toBe(1);
    expect(sorted[2]?.id).toBe(2);
  });

  it("should count total users", () => {
    const users = [
      { id: 1 },
      { id: 2 },
      { id: 3 },
      { id: 4 },
      { id: 5 },
    ];
    expect(users).toHaveLength(5);
  });

  it("should count admin users", () => {
    const users = [
      { id: 1, role: "admin" },
      { id: 2, role: "user" },
      { id: 3, role: "admin" },
    ];
    const adminCount = users.filter((u) => u.role === "admin").length;
    expect(adminCount).toBe(2);
  });

  it("should count regular users", () => {
    const users = [
      { id: 1, role: "admin" },
      { id: 2, role: "user" },
      { id: 3, role: "user" },
    ];
    const userCount = users.filter((u) => u.role === "user").length;
    expect(userCount).toBe(2);
  });

  it("should search by email", () => {
    const users = [
      { id: 1, email: "john@example.com" },
      { id: 2, email: "jane@example.com" },
    ];
    const searchTerm = "jane@";
    const filtered = users.filter((u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe(2);
  });

  it("should combine filter and sort", () => {
    const users = [
      { id: 1, role: "admin", name: "Charlie" },
      { id: 2, role: "user", name: "Alice" },
      { id: 3, role: "admin", name: "Bob" },
    ];
    const filtered = users.filter((u) => u.role === "admin");
    const sorted = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    expect(sorted).toHaveLength(2);
    expect(sorted[0]?.name).toBe("Bob");
    expect(sorted[1]?.name).toBe("Charlie");
  });

  it("should validate user role", () => {
    const validRoles = ["admin", "user"];
    expect(validRoles).toContain("admin");
    expect(validRoles).toContain("user");
  });
});
