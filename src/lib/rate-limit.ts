import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { NextResponse } from "next/server"

function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

const redis = createRedis()

function slidingWindow(requests: number, window: `${number} s` | `${number} m` | `${number} h`): Ratelimit | null {
  if (!redis) return null
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) })
}

export const loginLimiter = slidingWindow(5, "15 m")
export const registerLimiter = slidingWindow(3, "1 h")
export const forgotPasswordLimiter = slidingWindow(3, "1 h")
export const resetPasswordLimiter = slidingWindow(5, "15 m")
export const resendVerificationLimiter = slidingWindow(3, "15 m")
export const aiLimiter = slidingWindow(20, "1 h")

export function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}

export async function applyRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<NextResponse | null> {
  if (!limiter) return null
  try {
    const { success, reset } = await limiter.limit(key)
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      const minutes = Math.ceil(retryAfter / 60)
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.` },
        { status: 429, headers: { "Retry-After": String(retryAfter) } }
      )
    }
    return null
  } catch {
    return null // fail open on Upstash errors
  }
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<boolean> {
  if (!limiter) return true
  try {
    const { success } = await limiter.limit(key)
    return success
  } catch {
    return true // fail open
  }
}
