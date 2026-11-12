import type { UserRole } from "@/types/domain";

export const DEMO_ACCESS_TOKEN_PREFIX = "mindora-demo";

const DEMO_ACCOUNTS = [
  {
    email: "client.demo@example.test",
    password: "ClientDemo!2026",
    userId: "00000000-0000-4000-8000-000000000001",
    role: "PATIENT",
  },
  {
    email: "therapist.demo@example.test",
    password: "TherapistDemo!2026",
    userId: "00000000-0000-4000-8000-000000000002",
    role: "THERAPIST",
  },
  {
    email: "admin.demo@example.test",
    password: "AdminDemo!2026",
    userId: "00000000-0000-4000-8000-000000000003",
    role: "ADMIN",
  },
] as const satisfies ReadonlyArray<{
  email: string;
  password: string;
  userId: string;
  role: UserRole;
}>;

export interface DemoUser {
  userId: string;
  email: string;
  role: UserRole;
}

export function authenticateDemoUser(email: string, password: string): DemoUser | null {
  const account = DEMO_ACCOUNTS.find(
    (candidate) => candidate.email === email.trim().toLowerCase() && candidate.password === password
  );

  if (!account) return null;

  return {
    userId: account.userId,
    email: account.email,
    role: account.role,
  };
}

export function demoAccessTokenForRole(role: UserRole): string {
  return `${DEMO_ACCESS_TOKEN_PREFIX}.${role}`;
}
