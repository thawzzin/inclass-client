import type { Enrollment, Student } from '@/src/lib/api/types';

export function availableStudents(students: Student[], enrollments: Enrollment[]): Student[] {
  const enrolledIds = new Set(enrollments.map((enrollment) => enrollment.studentId));
  return students.filter((student) => !enrolledIds.has(student.id));
}

export function toggleStudentSelection(selected: string[], studentId: string): string[] {
  return selected.includes(studentId)
    ? selected.filter((id) => id !== studentId)
    : [...selected, studentId];
}
