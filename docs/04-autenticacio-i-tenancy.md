# 4) Autenticació i tenancy

## Concepte

La app és multi-tenant: cada petició ha d'anar contextualitzada a una organització.

Mecanismes utilitzats:

- Cookie `tenant`.
- Header `X-Tenant`.
- Resolució explícita de tenant (sense detecció per subdomini).
- Flux de login directe en single-domain.

## `useAuth()` (nucli)

Fitxer: `src/modules/auth/composables/useAuth.ts`

Exposa:

- `login`
- `register`
- `logout`
- `fetchUser`
- `isAuthenticated`, `isLoading`, `error`, `user`

## Fluxos de login

### 1) Login principal (single-domain)

1. L'usuari introdueix email + password (i organització opcional).
2. Es crida `POST /central/login`.
3. Backend retorna token final + `tenant_id`.
4. Frontend guarda cookies (`token`, `tenant`) i crida `fetchUser()`.

### 2) Login amb organització explícita

1. Si el compte existeix en múltiples tenants, backend retorna `organization_required`.
2. L'usuari especifica organització i es repeteix `POST /central/login`.
3. Amb resposta correcta, sessió queda oberta al tenant seleccionat.

### 3) Context tenant en API

1. Interceptor Axios injecta `Authorization` i `X-Tenant`.
2. `X-Tenant` es resol des de cookie/localStorage o header explícit de la petició.
3. No es fa inferència automàtica des del host/subdomini.

## Cookies i persistència

- `token`: sessió d'usuari.
- `tenant`: context d'organització.
- `active_admin_tenant` (localStorage): suport de context admin.

## Seguretat (estat actual)

- Token accessible des del frontend (cookie no `httpOnly`) per injectar headers.
- És funcional per SPA, però una evolució recomanada és moure cap a sessions amb cookies `httpOnly` quan el backend i el flux ho permetin.
