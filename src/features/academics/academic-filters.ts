import type { Course, Section } from '@/src/lib/api/types';

export function filterCourses(courses: Course[], search: string): Course[] {
  const value = search.trim().toLowerCase();
  if (!value) return courses;
  return courses.filter(
    (course) =>
      course.code.toLowerCase().includes(value) ||
      course.name.toLowerCase().includes(value),
  );
}

export function filterSections(
  sections: Section[],
  filters: { courseId: string; search: string },
): Section[] {
  const value = filters.search.trim().toLowerCase();
  return sections.filter((section) => {
    if (filters.courseId && section.courseId !== filters.courseId) return false;
    if (!value) return true;
    return [
      section.sectionCode,
      section.course.code,
      section.course.name,
      section.teacher.name,
    ].some((field) => field.toLowerCase().includes(value));
  });
}
