# 4) Autenticació i tenancy

## Concepte

La app és multi-tenant: cada petició ha d'anar contextualitzada a una organització.

Mecanismes utilitzats:

- Cookie `tenant`.
- Header `X-Tenant`.
- Detecció de tenant per subdomini.
- Flux central/subdomini per login.

## `useAuth()` (nucli)

Fitxer: `src/modules/auth/composables/useAuth.ts`

Exposa:

- `login`
- `register`
- `logout`
- `fetchUser`
- `completeTenantRedirectLogin`
- `isAuthenticated`, `isLoading`, `error`, `user`

## Fluxos de login

### 1) Login en domini central

1. L'usuari introdueix tenant + email + password.
2. Es crida `POST /central/login`.
3. Backend retorna `tenant_host` + `exchange_token`.
4. Frontend redirigeix a `https://tenant-host/auth/callback?...`.
5. A `AuthCallback`, es fa `POST /auth/exchange-token` i s'obté token final.

### 2) Login en domini tenant

1. Es guarda cookie `tenant`.
2. Es crida `POST /login` amb header `X-Tenant`.
3. Si retorna token:
   - guarda cookie `token`,
   - injecta `Authorization` al client Axios,
   - crida `fetchUser()`.

### 3) Fallback intel·ligent

Si el login tenant falla per errors de tenancy (422/500 relacionats), `useAuth` reintenta automàticament el flux central.

## Cookies i persistència

- `token`: sessió d'usuari.
- `tenant`: context d'organització.
- `active_admin_tenant` (localStorage): suport de context admin.

## Seguretat (estat actual)

- Token accessible des del frontend (cookie no `httpOnly`) per injectar headers.
- És funcional per SPA, però una evolució recomanada és moure cap a sessions amb cookies `httpOnly` quan el backend i el flux ho permetin.
