import { LoginForm } from '@/src/features/auth/login-form';
import { Brand } from '@/src/components/layout/brand';
import { Card } from '@/src/components/ui/card';

export default function LoginPage() {
  return (
    <main className="ic-login">
      <Card className="ic-login-card">
        <Brand linked={false} />
        <h1>Sign in to your account</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Use your administrator or teacher account.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </Card>
    </main>
  );
}
