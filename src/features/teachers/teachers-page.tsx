'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/src/features/auth/auth-context';
import { queryKeys } from '@/src/lib/api/query-keys';
import type { EntityStatus, Teacher } from '@/src/lib/api/types';

import { TeacherForm, TeacherPasswordForm } from './teacher-forms';
import { teacherListParams } from './teacher-contract';
import { teachersApi } from './teachers.api';

export function TeachersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EntityStatus>();
  const [editing, setEditing] = useState<Teacher>();
  const [passwordTeacher, setPasswordTeacher] = useState<Teacher>();
  const [creating, setCreating] = useState(false);
  const params = teacherListParams({ page, pageSize: 20, search, status });
  const teachers = useQuery({ queryKey: [...queryKeys.teachers.all, params], queryFn: () => teachersApi.list(params), enabled: user?.role === 'ADMIN' });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: EntityStatus }) => teachersApi.setStatus(id, nextStatus),
    onSuccess: () => { void invalidate(); toast.success('Teacher status updated and active sessions revoked.'); },
    onError: () => toast.error('Unable to update teacher status.'),
  });

  if (user?.role !== 'ADMIN') return <p className="text-sm text-zinc-500">You are not authorized to manage teachers.</p>;
  if (teachers.isLoading) return <p className="text-sm text-zinc-500">Loading teachers…</p>;
  if (teachers.isError) return <button type="button" onClick={() => void teachers.refetch()} className="text-sm underline">Unable to load teachers. Retry</button>;
  if (!teachers.data) return null;

  return <section className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold">Teachers</h1><p className="mt-1 text-sm text-zinc-500">Manage teacher accounts and access.</p></div><button type="button" onClick={() => setCreating(true)} className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950">Add teacher</button></div><div className="flex flex-wrap gap-3"><input aria-label="Search teachers" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name or email" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"/><select aria-label="Filter by status" value={status ?? ''} onChange={(event) => { setStatus((event.target.value || undefined) as EntityStatus | undefined); setPage(1); }} className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>{(creating || editing) && <TeacherForm teacher={editing} onClose={() => { setCreating(false); setEditing(undefined); }} onSaved={() => { void invalidate(); setCreating(false); setEditing(undefined); }} />}{passwordTeacher && <TeacherPasswordForm teacher={passwordTeacher} onClose={() => setPasswordTeacher(undefined)} />}<div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800"><table className="w-full text-left text-sm"><thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900"><tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{teachers.data.items.map((teacher) => <tr key={teacher.id} className="border-t border-zinc-200 dark:border-zinc-800"><td className="p-3 font-medium"><Link href={`/teachers/${teacher.id}`} className="underline">{teacher.name}</Link></td><td className="p-3">{teacher.email}</td><td className="p-3">{teacher.status}</td><td className="p-3"><button type="button" onClick={() => setEditing(teacher)} className="mr-3 underline">Edit</button><button type="button" onClick={() => setPasswordTeacher(teacher)} className="mr-3 underline">Password</button><button type="button" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ id: teacher.id, nextStatus: teacher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })} className="underline">{teacher.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table></div><div className="flex items-center justify-between text-sm"><span>{teachers.data.total} teachers</span><div className="space-x-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1 disabled:opacity-50">Previous</button><button type="button" disabled={page >= teachers.data.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-50">Next</button></div></div></section>;
}
