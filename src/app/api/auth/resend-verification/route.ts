import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import { validateOrigin } from "@/lib/csrf"
import { applyRateLimit, resendVerificationLimiter, getIp } from "@/lib/rate-limit"
import { z } from "zod"

const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: Request) {
  const csrfError = validateOrigin(request)
  if (csrfError) return csrfError

  const ip = getIp(request)
  const body = await request.json()

  const result = ResendVerificationSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 })
  }

  const { email } = result.data

  const rateLimitError = await applyRateLimit(resendVerificationLimiter, `resend-verification:${ip}:${email}`)
  if (rateLimitError) return rateLimitError

  const user = await db.user.findUnique({ where: { email } })

  // Always succeed to avoid leaking whether email exists
  if (!user || user.emailVerified) {
    return NextResponse.json({ success: true })
  }

  await db.verificationToken.deleteMany({ where: { identifier: email } })

  const token = randomUUID()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  await sendVerificationEmail(email, token)

  return NextResponse.json({ success: true })
}
