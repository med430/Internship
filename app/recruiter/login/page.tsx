import { RecruiterLoginForm } from "@/components/auth/recruiter-login-form";

export default function RecruiterLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-4xl">
        <RecruiterLoginForm />
      </div>
    </div>
  );
}
