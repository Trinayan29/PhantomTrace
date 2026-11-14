# PhantomTrace frontend

React + TypeScript (Vite). Run: `npm install && npm run dev` (proxies `/api` to http://localhost:8000).

## Backend contract (ASSUMED - confirm and adjust src/lib/api.ts + types.ts)
- POST /api/auth/register/ -> { access, refresh, user }
  body: { full_name, email, password, organization: {mode:"create",name} | {mode:"join",slug}, role }
- POST /api/auth/login/    body { email, password } -> { access, refresh, user }
- POST /api/auth/refresh/  body { refresh } -> { access, refresh? }
- POST /api/auth/logout/   body { refresh } (Bearer access) -> 204
- GET  /api/auth/profile/  -> user { id, full_name, email, is_active, role, organization|null, memberships[], permissions[] }
Errors: DRF style `{ "detail": "..." }` or `{ "field": ["msg"] }`.

## Notes for backend
- Frontend routing by role is UX only; DRF must enforce every permission.
- Never trust the `role` sent at signup: only org creators become organization_admin; super_admin is never self-assigned.
- Refresh token is stored in localStorage for now; an httpOnly cookie is safer if you can set it.
