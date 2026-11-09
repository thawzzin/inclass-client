'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { useAuth } from '@/src/features/auth/auth-context';
import { queryKeys } from '@/src/lib/api/query-keys';
import type { EntityStatus, Student } from '@/src/lib/api/types';

import { studentsApi } from './students.api';
import { toStudentQuery } from './student-query';

export function StudentsPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EntityStatus | undefined>();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Student | null>(null);
  const [creating, setCreating] = useState(false);
  const params = toStudentQuery({ page, pageSize: 20, search, status });
  const students = useQuery({ queryKey: [...queryKeys.students.all, params], queryFn: () => studentsApi.list(params), enabled: user?.role === 'ADMIN' });
  const invalidate = () => client.invalidateQueries({ queryKey: queryKeys.students.all });
  const changeStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: EntityStatus }) => studentsApi.setStatus(id, status), onSuccess: () => { void invalidate(); toast.success('Student status updated.'); }, onError: () => toast.error('Unable to update student status.') });

  if (user?.role !== 'ADMIN') return <p className="text-sm text-zinc-500">You are not authorized to manage students.</p>;
  if (students.isLoading) return <p className="text-sm text-zinc-500">Loading students…</p>;
  if (students.isError) return <button type="button" onClick={() => void students.refetch()} className="text-sm underline">Unable to load students. Retry</button>;
  const data = students.data;
  if (!data) return null;

  return <section className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">Students</h1><p className="mt-1 text-sm text-zinc-500">Manage active student records.</p></div><button type="button" onClick={() => setCreating(true)} className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-950">Add student</button></div><div className="flex flex-wrap gap-3"><input aria-label="Search students" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name or student ID" className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700" /><select aria-label="Filter by status" value={status ?? ''} onChange={(event) => { setStatus((event.target.value || undefined) as EntityStatus | undefined); setPage(1); }} className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></div>{(creating || editing) && <StudentForm student={editing ?? undefined} onClose={() => { setCreating(false); setEditing(null); }} onSaved={() => { void invalidate(); setCreating(false); setEditing(null); }} />}<div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800"><table className="w-full text-left text-sm"><thead className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900"><tr><th className="p-3">Student ID</th><th className="p-3">Full name</th><th className="p-3">Nickname</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead><tbody>{data.items.map((student) => <tr key={student.id} className="border-t border-zinc-200 dark:border-zinc-800"><td className="p-3 font-medium">{student.studentId}</td><td className="p-3">{student.fullName}</td><td className="p-3">{student.nickname ?? '—'}</td><td className="p-3">{student.status}</td><td className="p-3"><button type="button" onClick={() => setEditing(student)} className="mr-3 underline">Edit</button><button type="button" disabled={changeStatus.isPending} onClick={() => changeStatus.mutate({ id: student.id, status: student.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })} className="underline">{student.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table></div><div className="flex items-center justify-between text-sm"><span>{data.total} students</span><div className="space-x-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border px-3 py-1 disabled:opacity-50">Previous</button><button type="button" disabled={page >= data.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border px-3 py-1 disabled:opacity-50">Next</button></div></div></section>;
}

function StudentForm({ student, onClose, onSaved }: { student?: Student; onClose(): void; onSaved(): void }) {
  const [studentId, setStudentId] = useState(student?.studentId ?? ''); const [fullName, setFullName] = useState(student?.fullName ?? ''); const [nickname, setNickname] = useState(student?.nickname ?? ''); const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); try { const input = { studentId: studentId.trim(), fullName: fullName.trim(), nickname: nickname.trim() || null }; if (!input.studentId || !input.fullName) throw new Error(); if (student) { await studentsApi.update(student.id, input); } else { await studentsApi.create(input); } toast.success(student ? 'Student updated.' : 'Student created.'); onSaved(); } catch { toast.error('Enter a student ID and full name, then try again.'); } finally { setSaving(false); } }
  return <form onSubmit={submit} className="grid gap-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"><h2 className="font-semibold">{student ? 'Edit student' : 'Add student'}</h2><input aria-label="Student ID" value={studentId} onChange={(event) => setStudentId(event.target.value)} placeholder="Student ID" className="rounded border px-3 py-2 dark:border-zinc-700" /><input aria-label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Full name" className="rounded border px-3 py-2 dark:border-zinc-700" /><input aria-label="Nickname" value={nickname} onChange={(event) => setNickname(event.target.value)} placeholder="Nickname (optional)" className="rounded border px-3 py-2 dark:border-zinc-700" /><div className="space-x-2"><button disabled={saving} className="rounded bg-zinc-950 px-3 py-2 text-sm text-white dark:bg-zinc-50 dark:text-zinc-950">Save</button><button type="button" onClick={onClose} className="rounded border px-3 py-2 text-sm">Cancel</button></div></form>;
}
