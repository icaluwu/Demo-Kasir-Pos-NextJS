import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  username?: string;
  isLoggedIn: boolean;
};

export function getSessionOptions(): SessionOptions {
  const password =
    process.env.SESSION_SECRET ??
    (process.env.NODE_ENV === "development"
      ? "dev-only-CHANGE-ME-in-.env-32chars!!"
      : undefined);
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET wajib di .env dan minimal 32 karakter (lihat .env.example)."
    );
  }
  return {
    password,
    cookieName: "ical_demo_pos",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}
