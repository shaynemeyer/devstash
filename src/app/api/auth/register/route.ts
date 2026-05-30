import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"
import { db } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import { validateOrigin } from "@/lib/csrf"

const EMAIL_VERIFICATION_ENABLED = process.env.EMAIL_VERIFICATION_ENABLED === "true"

export async function POST(request: Request) {
  const csrfError = validateOrigin(request)
  if (csrfError) return csrfError

  const body = await request.json()
  const { name, email, password, confirmPassword } = body

  if (!email || !password || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)

  await db.user.create({
    data: { name, email, password: hashed },
  })

  if (EMAIL_VERIFICATION_ENABLED) {
    const token = randomUUID()
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await db.verificationToken.create({
      data: { identifier: email, token, expires },
    })

    await sendVerificationEmail(email, token)
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
