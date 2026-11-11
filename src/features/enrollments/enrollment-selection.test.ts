import type { Enrollment, Student } from '@/src/lib/api/types';

import {
  availableStudents,
  toggleStudentSelection,
} from './enrollment-selection';

const student = (id: string): Student => ({
  id,
  studentId: id.toUpperCase(),
  fullName: `Student ${id}`,
  nickname: null,
  status: 'ACTIVE',
  createdAt: '',
  updatedAt: '',
});

describe('enrollment selection', () => {
  it('excludes students already enrolled in the section', () => {
    const enrolled: Enrollment[] = [
      {
        id: 'e1',
        studentId: 's1',
        sectionId: 'section',
        createdAt: '',
        student: student('s1'),
      },
    ];
    expect(availableStudents([student('s1'), student('s2')], enrolled)).toEqual(
      [student('s2')],
    );
  });

  it('adds and removes an ID without creating duplicates', () => {
    expect(toggleStudentSelection(['s1'], 's1')).toEqual([]);
    expect(toggleStudentSelection(['s1'], 's2')).toEqual(['s1', 's2']);
  });
});
