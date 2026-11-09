import { teacherListParams, teacherPasswordSchema } from './teacher-contract';

describe('teacherListParams', () => {
  it('trims search and omits empty filters', () => {
    expect(teacherListParams({ page: 1, pageSize: 20, search: '  ', status: undefined })).toEqual({
      page: 1,
      pageSize: 20,
    });
    expect(teacherListParams({ page: 2, pageSize: 20, search: '  Ada  ', status: 'ACTIVE' })).toEqual({
      page: 2,
      pageSize: 20,
      search: 'Ada',
      status: 'ACTIVE',
    });
  });
});

describe('teacherPasswordSchema', () => {
  it('requires matching passwords that satisfy the backend length contract', () => {
    expect(
      teacherPasswordSchema.safeParse({ newPassword: 'TeacherPassword123!', confirmPassword: 'different-password' }).success,
    ).toBe(false);
    expect(
      teacherPasswordSchema.safeParse({ newPassword: 'TeacherPassword123!', confirmPassword: 'TeacherPassword123!' }).success,
    ).toBe(true);
  });
});
