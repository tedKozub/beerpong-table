"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSession, decrypt } from "@/lib/session";

export async function login(formData: FormData) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!(formData.get("name") === adminUsername)) {
    return;
  }
  if (!(formData.get("password") === adminPassword)) {
    return;
  }
  // create session
  await createSession("1");

  console.log("login succesful");
  redirect("/");
}

export async function logout() {
  // deleteSession();
  cookies().delete("session");
  redirect("/login");
}

export async function getSession() {
  const cookie = cookies().get("session")?.value;
  const session = await decrypt(cookie);
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Neoprávněný přístup: Tato akce vyžaduje přihlášení administrátora.");
  }
  return session;
}
