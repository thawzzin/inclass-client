# InClass UI contract

The existing backend contract and role permissions remain authoritative. The visual prototype supplies appearance, not sample data or authorization behavior.

## Canonical UI Map

| Capability     | Canonical owner                    | Source of truth                    | Allowed variants                      | Verification                    |
| -------------- | ---------------------------------- | ---------------------------------- | ------------------------------------- | ------------------------------- |
| Select/Listbox | shadcn NativeSelect                | Existing feature filters and forms | Section, status, course               | Keyboard and browser check      |
| Date           | Native date input                  | Attendance API date fields         | Session date, history range           | Date validation tests           |
| Form           | shadcn fields with React Hook Form | Feature schemas and API errors     | Create, edit, account                 | Form tests and browser check    |
| Toast          | shadcn Sonner provider             | `app/providers.tsx`                | Success, error                        | Interaction tests               |
| CRUD           | Existing feature API modules       | `docs/API_INTEGRATION.md`          | Students, teachers, courses, sections | Feature tests and browser check |

Native select and date popups follow the browser and operating system. InClass owns labels, selection state, validation, and the surrounding control style. All authenticated data remains scoped to the signed-in role.

The canonical UI components live in `src/components/ui`. They are generated from shadcn and use the project token mapping in `app/globals.css`. Feature screens compose them; custom layout and data views retain the prototype's appearance.
