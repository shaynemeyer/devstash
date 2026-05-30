import { NextResponse } from "next/server"

/**
 * Validates the Origin header against NEXTAUTH_URL to prevent CSRF on custom API routes.
 * Returns a 403 response if the origin doesn't match, or null if the check passes.
 */
export function validateOrigin(request: Request): NextResponse | null {
  const appUrl = process.env.NEXTAUTH_URL
  if (!appUrl) return null // Skip in dev when NEXTAUTH_URL is not configured

  let expectedOrigin: string
  try {
    expectedOrigin = new URL(appUrl).origin
  } catch {
    return null
  }

  const origin = request.headers.get("origin")
  if (!origin || origin !== expectedOrigin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return null
}
