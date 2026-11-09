import type { Course, Section } from '@/src/lib/api/types';

import { filterCourses, filterSections } from './academic-filters';

const course = (id: string, code: string, name: string): Course => ({
  id,
  code,
  name,
  status: 'ACTIVE',
  createdAt: '',
  updatedAt: '',
});

describe('academic filters', () => {
  const courses = [course('c1', 'CSC480', 'Software Engineering'), course('c2', 'MAT101', 'Calculus')];
  const sections: Section[] = [
    { id: 's1', courseId: 'c1', sectionCode: '901', teacherId: 't1', status: 'ACTIVE', createdAt: '', updatedAt: '', course: courses[0], teacher: { id: 't1', name: 'Ada', email: 'ada@example.edu', status: 'ACTIVE' } },
    { id: 's2', courseId: 'c2', sectionCode: '902', teacherId: 't2', status: 'ACTIVE', createdAt: '', updatedAt: '', course: courses[1], teacher: { id: 't2', name: 'Grace', email: 'grace@example.edu', status: 'ACTIVE' } },
  ];

  it('searches courses by code or name without case sensitivity', () => {
    expect(filterCourses(courses, 'software')).toEqual([courses[0]]);
    expect(filterCourses(courses, 'mat101')).toEqual([courses[1]]);
  });

  it('filters sections by course and search text', () => {
    expect(filterSections(sections, { courseId: 'c1', search: '' })).toEqual([sections[0]]);
    expect(filterSections(sections, { courseId: '', search: 'grace' })).toEqual([sections[1]]);
  });
});
