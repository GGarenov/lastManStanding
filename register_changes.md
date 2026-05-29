# Register: first name & last name

## Backend

- **`backend/src/modules/users/schemas/user.schema.ts`** — Added required `firstName` and `lastName` string fields (trimmed).
- **`backend/src/modules/users/user.interface.ts`** — Extended `User` interface with `firstName` and `lastName`.
- **`backend/src/modules/auth/auth.interface.ts`** — Extended `RegisterDto` with validated `firstName` and `lastName` (1–50 characters).
- **`backend/src/modules/auth/auth.service.ts`** — `register()` now accepts and persists `firstName` and `lastName`.
- **`backend/src/modules/auth/auth.controller.ts`** — Passes `firstName` and `lastName` from the register request body to the auth service.
- **Tests** — Updated `auth.service.spec.ts` and `auth.controller.spec.ts` for the new register signature and payload.

Existing users without these fields will still load; the admin UI shows `—` when a name is missing.

## Frontend — Register page

- **`frontend/src/api/auth.api.ts`** — `RegisterPayload` includes `firstName` and `lastName`.
- **`frontend/src/store/authStore.ts`** — `register()` accepts and sends first/last name.
- **`frontend/src/pages/user-pages/Register/Register.tsx`** — Added page heading, first name and last name inputs (side by side), and client-side validation.
- **`frontend/src/pages/user-pages/Register/Register.module.less`** — Layout for page heading and name row.
- **`frontend/src/locales/en/auth.json`** & **`frontend/src/locales/bg/auth.json`** — New labels, placeholders, heading, and validation messages.
- **`frontend/src/locales/labels/auth.labels.ts`** — Wired new i18n keys into register labels.

## Frontend — Admin users (`/admin/users`)

- **`frontend/src/api/types.ts`** — `BackendUser` and `LoginResponse.user` include optional `firstName` and `lastName`.
- **`frontend/src/pages/admin-pages/UsersManagement/UsersManagement.tsx`** — Table now shows **First name**, **Last name**, and **Username** columns (replacing the single “Name” column).

## API change

`POST /auth/register` body now expects:

```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "password": "secret123"
}
```
