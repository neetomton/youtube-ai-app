import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "ログイン | J-Creator AI Sync",
};

type SearchParams = Promise<{
  error?: string | string[];
  next?: string | string[];
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = Array.isArray(params.error) ? params.error[0] : params.error;

  return (
    <AuthShell
      title="ログイン"
      description="メールアドレスとパスワード、または Google アカウントでログインしてください。"
    >
      <LoginForm externalError={error} />
    </AuthShell>
  );
}
