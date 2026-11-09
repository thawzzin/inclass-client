import { SettingsForm } from '@/src/features/auth/settings-form';

export default function SettingsPage() {
  return <section><h1 className="text-2xl font-semibold tracking-tight">Settings</h1><p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Manage your profile and password.</p><div className="mt-6"><SettingsForm /></div></section>;
}
