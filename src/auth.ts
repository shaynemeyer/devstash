import NextAuth, { CredentialsSignin } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { checkRateLimit, loginLimiter, getIp } from "@/lib/rate-limit"

const EMAIL_VERIFICATION_ENABLED = process.env.EMAIL_VERIFICATION_ENABLED === "true"

class TooManyRequestsError extends CredentialsSignin {
  code = "too_many_requests"
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const ip = getIp(request)
        const email = credentials.email as string
        const allowed = await checkRateLimit(loginLimiter, `login:${ip}:${email}`)
        if (!allowed) throw new TooManyRequestsError()

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, image: true, password: true, emailVerified: true },
        })

        if (!user?.password) return null

        const valid = await bcrypt.compare(credentials.password as string, user.password)
        if (!valid) return null

        if (EMAIL_VERIFICATION_ENABLED && !user.emailVerified) return null

        return { id: user.id, name: user.name, email: user.email, image: user.image }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        // Record when this session started so we can compare against passwordChangedAt
        token.sessionStart = Math.floor(Date.now() / 1000)
      }

      // Invalidate the session if the password was changed after this token was issued
      if (token.id && token.sessionStart) {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { passwordChangedAt: true },
        })
        if (dbUser?.passwordChangedAt) {
          const changedAt = Math.floor(dbUser.passwordChangedAt.getTime() / 1000)
          if ((token.sessionStart as number) < changedAt) {
            return null
          }
        }
      }

      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
