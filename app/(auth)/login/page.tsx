import { LoginForm } from '@/src/features/auth/login-form';

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <section className="w-full max-w-sm rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-500">InClass</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Sign in to your account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Use your administrator or teacher account.
        </p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
