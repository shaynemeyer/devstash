import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { sendPasswordResetEmail } from "@/lib/email"
import { validateOrigin } from "@/lib/csrf"
import { ForgotPasswordSchema } from "@/lib/validations/auth"

export async function POST(request: Request) {
  const csrfError = validateOrigin(request)
  if (csrfError) return csrfError

  const body = await request.json()
  const result = ForgotPasswordSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { email } = result.data

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
