import type { AttendanceStatus, EntityStatus } from './types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface ProfileInput {
  name?: string;
  email?: string;
}

export interface PasswordChangeInput {
  currentPassword: string;
  newPassword: string;
}

export interface CreateTeacherInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateTeacherInput {
  name?: string;
  email?: string;
}

export interface CreateStudentInput {
  studentId: string;
  fullName: string;
  nickname?: string | null;
}

export type UpdateStudentInput = Partial<CreateStudentInput>;

export interface CreateCourseInput {
  code: string;
  name: string;
}

export type UpdateCourseInput = Partial<CreateCourseInput>;

export interface CreateSectionInput {
  courseId: string;
  sectionCode: string;
  teacherId: string;
}

export interface UpdateSectionInput {
  sectionCode?: string;
}

export interface StatusInput {
  status: EntityStatus;
}

export interface AttendanceSessionInput {
  date: string;
}

export interface AttendanceRecordInput {
  studentId: string;
  status: AttendanceStatus;
}
