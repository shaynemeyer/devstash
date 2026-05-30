import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in?error=missing-token", request.url))
  }

  const record = await db.verificationToken.findUnique({ where: { token } })

  if (!record) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-token", request.url))
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } })
    return NextResponse.redirect(new URL("/sign-in?error=expired-token", request.url))
  }

  await db.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  })

  await db.verificationToken.delete({ where: { token } })

  return NextResponse.redirect(new URL("/sign-in?verified=true", request.url))
}
