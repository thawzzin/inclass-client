import { toStudentQuery } from './student-query';

describe('toStudentQuery', () => {
  it('omits empty filters while retaining pagination', () => {
    expect(toStudentQuery({ page: 1, pageSize: 20, search: '', status: undefined })).toEqual({ page: 1, pageSize: 20 });
  });

  it('trims a search term and includes a status filter', () => {
    expect(toStudentQuery({ page: 2, pageSize: 20, search: '  Ana  ', status: 'ACTIVE' })).toEqual({ page: 2, pageSize: 20, search: 'Ana', status: 'ACTIVE' });
  });
});
