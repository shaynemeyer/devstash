import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a verification link to your email address. Click the link to activate your account.
          </p>
          <p className="text-sm text-muted-foreground">The link expires in 24 hours.</p>
        </div>
        <Link
          href="/sign-in"
          className="inline-flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}
