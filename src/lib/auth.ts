import { redirect } from "next/navigation";
import { getSession } from "./session";

export async function requireAuth() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.username) {
    redirect("/login");
  }
  return session;
}

export async function logoutAction() {
  "use server";
  const session = await getSession();
  session.destroy();
  await session.save();
  redirect("/login");
}
