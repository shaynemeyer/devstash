import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.email === "demo@devstash.io") {
    return NextResponse.json({ error: "Cannot delete the demo account" }, { status: 403 });
  }

  await db.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ success: true });
}
