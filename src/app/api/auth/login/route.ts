import { createSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = body?.name?.toString().trim();
    const password = body?.password?.toString();

    if (!name || !password) {
      return NextResponse.json(
        { success: false, error: "Vyplňte prosím uživatelské jméno i heslo." },
        { status: 400 }
      );
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (name !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { success: false, error: "Nesprávné přihlašovací jméno nebo heslo." },
        { status: 401 }
      );
    }

    await createSession("1");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Chyba serveru při přihlášení." },
      { status: 500 }
    );
  }
}
