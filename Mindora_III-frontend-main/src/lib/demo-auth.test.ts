import { authenticateDemoUser } from "@/lib/demo-auth";

describe("authenticateDemoUser", () => {
  it.each([
    ["client.demo@example.test", "ClientDemo!2026", "PATIENT"],
    ["therapist.demo@example.test", "TherapistDemo!2026", "THERAPIST"],
    ["admin.demo@example.test", "AdminDemo!2026", "ADMIN"],
  ] as const)("authenticates the demo %s account as %s", (email, password, role) => {
    expect(authenticateDemoUser(email, password)).toMatchObject({ email, role });
  });

  it("does not authenticate an unknown account or incorrect password", () => {
    expect(authenticateDemoUser("unknown@example.test", "password")).toBeNull();
    expect(authenticateDemoUser("client.demo@example.test", "wrong-password")).toBeNull();
  });

  it("matches email case-insensitively and ignores surrounding whitespace", () => {
    expect(authenticateDemoUser("  CLIENT.DEMO@EXAMPLE.TEST ", "ClientDemo!2026")).toMatchObject({
      role: "PATIENT",
    });
  });
});
