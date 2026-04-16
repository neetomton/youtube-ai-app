import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata = {
  title: "新規登録 | J-Creator AI Sync",
};

export default function SignupPage() {
  return (
    <AuthShell
      title="新規登録"
      description="メールアドレスで J-Creator AI Sync のアカウントを作成します。"
    >
      <SignupForm />
    </AuthShell>
  );
}
