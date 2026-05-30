import { SignInForm } from "@/components/auth/SignInForm";
import { RegistrationToast } from "@/components/auth/RegistrationToast";
import { VerifiedToast } from "@/components/auth/VerifiedToast";

interface SignInPageProps {
  searchParams: Promise<{ registered?: string; verified?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { registered, verified } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {registered === "true" && <RegistrationToast />}
        {verified === "true" && <VerifiedToast />}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Sign in to DevStash</h1>
          <p className="text-sm text-muted-foreground">Welcome back</p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
