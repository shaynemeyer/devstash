import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { validateOrigin } from "@/lib/csrf"

export async function POST(request: Request) {
  const csrfError = validateOrigin(request)
  if (csrfError) return csrfError

  const body = await request.json()
  const { token, password, confirmPassword } = body

  if (!token || !password || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 })
  }

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
