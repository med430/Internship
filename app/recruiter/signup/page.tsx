import { RecruiterSignupForm } from "@/components/auth/recruiter-signup-form";

export default function RecruiterSignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-10">
      <div className="w-full max-w-2xl">
        <RecruiterSignupForm />
      </div>
    </div>
  );
}
