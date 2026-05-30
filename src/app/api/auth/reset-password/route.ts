import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { validateOrigin } from "@/lib/csrf"
import { ResetPasswordSchema } from "@/lib/validations/auth"
import { applyRateLimit, resetPasswordLimiter, getIp } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const csrfError = validateOrigin(request)
  if (csrfError) return csrfError

  const ip = getIp(request)
  const rateLimitError = await applyRateLimit(resetPasswordLimiter, `reset-password:${ip}`)
  if (rateLimitError) return rateLimitError

  const body = await request.json()
  const result = ResetPasswordSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { token, password, confirmPassword } = result.data

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
  }

  const record = await db.verificationToken.findUnique({ where: { token } })

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 })
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } })
    return NextResponse.json({ error: "Reset link has expired" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 12)

  await db.user.update({
    where: { email: record.identifier },
    data: { password: hashed, passwordChangedAt: new Date() },
  })

  await db.verificationToken.delete({ where: { token } })

  return NextResponse.json({ success: true })
}
