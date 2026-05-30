import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = "onboarding@resend.dev"
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your DevStash email",
    html: `
      <p>Thanks for signing up for DevStash.</p>
      <p>Click the link below to verify your email address. The link expires in 24 hours.</p>
      <p><a href="${url}">Verify email</a></p>
      <p>If you did not create an account, you can ignore this email.</p>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your DevStash password",
    html: `
      <p>We received a request to reset your DevStash password.</p>
      <p>Click the link below to choose a new password. The link expires in 1 hour.</p>
      <p><a href="${url}">Reset password</a></p>
      <p>If you did not request a password reset, you can ignore this email.</p>
    `,
  })
}
