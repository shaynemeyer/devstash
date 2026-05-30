import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"

export async function POST(request: Request) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })

  // Always respond with success to avoid leaking whether an email exists
  if (!user || !user.password) {
    return NextResponse.json({ success: true })
  }

  // Delete any existing reset token for this email before creating a new one
  await db.verificationToken.deleteMany({ where: { identifier: email } })

  const token = randomUUID()
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await db.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  await sendPasswordResetEmail(email, token)

  return NextResponse.json({ success: true })
}
