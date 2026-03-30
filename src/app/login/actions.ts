"use server";

import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;

  if (!envUser || !envPass) {
    redirect("/login?error=config");
  }

  if (username !== envUser || password !== envPass) {
    redirect("/login?error=auth");
  }

  const session = await getSession();
  session.username = username;
  session.isLoggedIn = true;
  await session.save();
  redirect("/");
}
