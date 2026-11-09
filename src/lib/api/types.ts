export type Role = 'ADMIN' | 'TEACHER';
export type EntityStatus = 'ACTIVE' | 'INACTIVE';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  errors: unknown[];
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: EntityStatus;
}

export interface Teacher extends User {
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  nickname: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: string;
  courseId: string;
  sectionCode: string;
  teacherId: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  course: Course;
  teacher: Pick<User, 'id' | 'name' | 'email' | 'status'>;
}

export interface Enrollment {
  id: string;
  studentId: string;
  sectionId: string;
  createdAt: string;
  student: Student;
}

export interface AttendanceSession {
  id: string;
  sectionId: string;
  date: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  attendanceSessionId: string;
  studentId: string;
  status: AttendanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStatistics {
  totalExpected: number;
  present: number;
  absent: number;
  late: number;
  unmarked: number;
  attendancePercentage: number | null;
}

export interface AdminDashboardSummary {
  activeStudents: number;
  activeTeachers: number;
  activeCourses: number;
  activeSections: number;
  attendanceSessions: number;
}

export interface TeacherDashboardSummary {
  assignedSections: number;
  activeStudents: number;
  attendanceSessions: number;
}
