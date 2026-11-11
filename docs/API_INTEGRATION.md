# InClass API Integration

## Source of truth

This document was verified against `../inclass-backend/src` on 2026-11-08.
The backend route definitions, Zod schemas, and service selections are authoritative. The
checked-in `../inclass-backend/openapi.yaml` is a starter document and describes only health,
login, attendance-record history, and two dashboard routes; it must not be used as the sole
source for generated client types.

Base URL: `http://localhost:4000/api/v1` by default. The backend permits credentialed CORS only
from its configured `FRONTEND_URL`, which defaults to `http://localhost:3000`.

## Shared protocol

Every JSON response has this envelope:

```ts
type ApiSuccess<T> = { success: true; data: T; message: string };
type ApiFailure = { success: false; message: string; errors: unknown[] };
```

All protected requests use the `inclass_access` HttpOnly cookie. Refresh sessions use the
`inclass_refresh` HttpOnly cookie. Clients must set `withCredentials: true`; neither token is
available to JavaScript or should be stored in browser storage.

Before every state-changing request, request `GET /auth/csrf` when no current token is held and
send its returned `data.csrfToken` as `X-CSRF-Token`. The server also sets the readable
`inclass_csrf` cookie and requires its value to match the header. CSRF applies to all writes,
including resource-management and attendance endpoints.

Protected routes return `401` when unauthenticated and `403` for invalid CSRF or insufficient
role. Validation failures use `422`; uniqueness and duplicate attendance conflicts use `409`.

## Shared models

```ts
type Role = 'ADMIN' | 'TEACHER';
type EntityStatus = 'ACTIVE' | 'INACTIVE';
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: EntityStatus;
};

type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
```

Database dates are serialized JSON date-time strings. Attendance create/query date inputs use
`YYYY-MM-DD` strings.

## Routes

### Health and authentication

| Method | Path | Auth | Request / response data |
| --- | --- | --- | --- |
| GET | `/health` | No | `200` when database is reachable; `503` otherwise. |
| GET | `/auth/csrf` | No | Returns `{ csrfToken: string }`; establishes/rotates the CSRF cookie. |
| POST | `/auth/login` | CSRF | `{ email, password }`; both are trimmed/validated, password is 12–128 chars. Returns `{ user: User }` and sets auth cookies. Rate limited to 10 requests/IP/15 min. |
| POST | `/auth/refresh` | CSRF | No body. Returns `{ user: User }` and rotates auth cookies. |
| POST | `/auth/logout` | CSRF | No body. Returns `{}` and clears auth cookies. |
| GET | `/auth/me` | Yes | Returns `{ user: User }`. |
| PATCH | `/auth/profile` | Yes + CSRF | At least one of `{ name?: string, email?: string }`; returns `{ user: User }`. |
| PATCH | `/auth/password` | Yes + CSRF | `{ currentPassword, newPassword }`, each 12–128 chars; returns `{}` and clears auth cookies. |

### Teacher accounts — ADMIN only

Teacher objects extend `User` with `createdAt` and `updatedAt`.

| Method | Path | Request / response data |
| --- | --- | --- |
| GET | `/users?page=1&pageSize=20&search=&status=` | `page` positive; `pageSize` 1–100; optional `search` and `ACTIVE`/`INACTIVE` status. Returns `Paginated<Teacher>`. |
| POST | `/users` | CSRF; `{ name, email, password }`, with password 12–128 chars. Returns a `Teacher` (`201`). |
| GET | `/users/:id` | Returns a `Teacher`. |
| PATCH | `/users/:id` | CSRF; at least one of `{ name?, email? }`. Returns a `Teacher`. |
| PATCH | `/users/:id/status` | CSRF; `{ status: EntityStatus }`. Returns a `Teacher` and revokes the teacher's sessions. |
| PATCH | `/users/:id/password` | CSRF; `{ password }`, 12–128 chars. Returns `{}` and revokes the teacher's sessions. |

These routes never expose password hashes and cannot target administrator accounts.

### Students — list and direct details are ADMIN only

```ts
type Student = {
  id: string;
  studentId: string;
  fullName: string;
  nickname: string | null;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
};
```

| Method | Path | Request / response data |
| --- | --- | --- |
| GET | `/students?page=1&pageSize=20&search=&status=` | Returns `Paginated<Student>`; search matches student ID, full name, or nickname. |
| POST | `/students` | CSRF; `{ studentId, fullName, nickname?: string \| null }`. Returns `Student` (`201`). |
| GET | `/students/:id` | Returns `Student`. |
| PATCH | `/students/:id` | CSRF; non-empty partial of the create input. Returns `Student`. |
| PATCH | `/students/:id/status` | CSRF; `{ status: EntityStatus }`. Returns `Student`. |

### Courses and sections

Courses expose `id`, `code`, `name`, `status`, `createdAt`, and `updatedAt`.
Sections expose `id`, `courseId`, `sectionCode`, `teacherId`, `status`, timestamps, a course, and
the assigned teacher `{ id, name, email, status }`.

| Method | Path | Access / request data |
| --- | --- | --- |
| GET | `/courses` | ADMIN: all courses; TEACHER: only courses with an assigned section. No query parameters. |
| GET | `/courses/:id` | Same role scope; returns course only, not its sections. |
| POST | `/courses` | ADMIN + CSRF; `{ code: string(1..32), name: string(1..120) }`; `201`. |
| PATCH | `/courses/:id` | ADMIN + CSRF; non-empty partial of create input. |
| PATCH | `/courses/:id/status` | ADMIN + CSRF; `{ status }`. |
| GET | `/sections` | ADMIN: all sections; TEACHER: assigned sections only. No filters or pagination. |
| GET | `/sections/:id` | Role-scoped section detail. |
| POST | `/sections` | ADMIN + CSRF; `{ courseId: UUID, sectionCode: string(1..32), teacherId: UUID }`; `201`; teacher must be active. |
| PATCH | `/sections/:id` | ADMIN + CSRF; `{ sectionCode }`. |
| PATCH | `/sections/:id/status` | ADMIN + CSRF; `{ status }`. |
| PATCH | `/sections/:id/teacher` | ADMIN + CSRF; `{ teacherId: UUID }`; teacher must be active. |

### Enrollments

| Method | Path | Access / request data |
| --- | --- | --- |
| GET | `/sections/:id/enrollments` | ADMIN, or assigned TEACHER. Returns enrollment records with included student data. |
| POST | `/sections/:id/enrollments` | ADMIN + CSRF; `{ studentId: UUID }`; `201`. |
| POST | `/sections/:id/enrollments/bulk` | ADMIN + CSRF; `{ studentIds: UUID[] }`, 1–500 unique IDs; `201`. |
| DELETE | `/sections/:id/enrollments/:studentId` | ADMIN + CSRF; returns `{}`. |

Removing enrollment does not delete captured attendance rosters or attendance records.

### Attendance

Only one session exists per section and calendar date. Creating a duplicate returns `409` with
`Attendance session already exists for this date`. A session captures currently enrolled ACTIVE
students into a roster; later enrollment changes do not alter that roster.

| Method | Path | Access / request data |
| --- | --- | --- |
| GET | `/sections/:id/attendance-sessions` | ADMIN, or assigned TEACHER. Returns sessions ordered by descending date. |
| POST | `/sections/:id/attendance-sessions` | Authorized user + CSRF; `{ date: 'YYYY-MM-DD' }`; `201`. |
| GET | `/attendance-sessions/:id` | Authorized user. Returns the session, section, captured roster, each student, and any existing attendance record. |
| POST | `/attendance-sessions/:id/records/bulk` | Authorized user + CSRF; `{ records: [{ studentId: UUID, status: AttendanceStatus }] }`; at least one unique student. Creates records only for students without an existing record; `409` if any submitted record already exists. |
| PATCH | `/attendance-sessions/:id/records/:studentId` | Authorized user + CSRF; `{ status: AttendanceStatus }`. Returns `{}`; `404` if no existing record exists. |
| POST | `/attendance-sessions/:id/records/mark-all-present` | Authorized user + CSRF; no body. Returns `{ marked: number }`; does not replace existing ABSENT or LATE records. |
| GET | `/attendance-records` | Authorized user. Optional `sectionId`, `dateFrom`, `dateTo`, `status`, `page`, `pageSize`; returns paginated submitted records with captured student and session/section/course data. Add `format=csv` for CSV download. Teachers receive only assigned-section data. |
| GET | `/sections/:id/attendance-statistics` | Authorized user; optional `dateFrom`, `dateTo`. Returns `{ totalExpected, present, absent, late, unmarked, attendancePercentage }`. |
| GET | `/students/:id/attendance` | Authorized user; optional `dateFrom`, `dateTo`. Returns `{ items, statistics }`; items are captured-roster entries including a nullable attendance record, so missing records are UNMARKED. Results remain within the caller's role scope. |

Statistics use `(present + late) / (present + absent + late) × 100`; unmarked students are
represented by a missing attendance record and are excluded from that denominator.

### Dashboard

| Method | Path | Response data |
| --- | --- | --- |
| GET | `/dashboard/summary` | ADMIN: `activeStudents`, `activeTeachers`, `activeCourses`, `activeSections`, `attendanceSessions`. TEACHER: `assignedSections`, `activeStudents` (distinct enrolled active students), `attendanceSessions`. |
| GET | `/dashboard/attendance-stats` | Role-scoped backend attendance statistics. |
| GET | `/dashboard/recent-attendance` | Up to 10 role-scoped recent sessions with section/course, creator `{ id, name }`, and captured-roster count. |

## Integration blockers and implementation implications

- There is no backend endpoint for teachers to browse all students or fetch an arbitrary student
  by ID. Teacher UI must use section enrollment or attendance data only.
- There is no server-side course/section search, pagination, or course filter, and course detail
  has no nested section list. Future UI must not claim these are backend filters.
- Teacher list responses do not contain assigned sections.
- The API supports refresh, but client refresh coalescing and 401 retry behavior belong to Phase 2
  after session restoration is implemented.
