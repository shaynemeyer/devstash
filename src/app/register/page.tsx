import { RegisterForm } from "@/components/auth/RegisterForm";
import NavBar from "@/components/marketing/NavBar";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 pt-16">
      <NavBar />
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start building your knowledge hub</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
