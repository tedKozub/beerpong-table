"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createSession, decrypt } from "@/lib/session";

export type LoginResult = {
  success: boolean;
  error?: string;
};

export async function loginAction(values: {
  name?: string;
  password?: string;
}): Promise<LoginResult> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const name = values.name?.trim();
  const password = values.password;

  if (!name || !password) {
    return { success: false, error: "Zadejte uživatelské jméno i heslo." };
  }

  if (name !== adminUsername || password !== adminPassword) {
    return { success: false, error: "Nesprávné přihlašovací jméno nebo heslo." };
  }

  // create session
  await createSession("1");
  return { success: true };
}

export async function login(formData: FormData): Promise<LoginResult | void> {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  const name = formData.get("name")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!name || !password || name !== adminUsername || password !== adminPassword) {
    return { success: false, error: "Nesprávné přihlašovací jméno nebo heslo." };
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
