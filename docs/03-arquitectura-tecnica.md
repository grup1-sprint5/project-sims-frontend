# 3) Arquitectura tècnica

## Stack principal

- **Framework**: Vue 3 (Composition API)
- **Build tool**: Vite
- **Llenguatge**: TypeScript
- **Routing**: Vue Router
- **Estat global**: Pinia
- **HTTP client**: Axios (`src/services/api.ts`)
- **Mapa**: Leaflet
- **Estils**: Tailwind CSS
- **Toasts**: vue3-toastify

## Entrada d'aplicació

`src/main.ts`:

- crea app Vue,
- registra Pinia,
- registra router,
- configura toasts (posició diferent entre mòbil i desktop),
- munta `App.vue`.

`src/App.vue` és minimalista: renderitza `<router-view />`.

## Organització per mòduls

Estructura per domini funcional sota `src/modules/`:

- `auth`, `client`, `admin`, `tickets`, `common`, `map`.

Això facilita separar:

- components,
- composables,
- pàgines,
- interfícies,
- rutes de cada mòdul.

## Routing

El router principal (`src/router/index.ts`) defineix:

- Layout d'app (`AppLayout`) per rutes client/protegides.
- Layout admin (`AdminLayout`) per zona administrativa.
- Rutes d'autenticació (`authRoutes`).
- Landing (`/landing`) i NotFound.

### Guards de navegació

`beforeEach` fa:

- Hidratar usuari si hi ha token però no hi ha `user` carregat.
- Bloquejar rutes amb `requiresAuth` si no hi ha sessió.
- Bloquejar zona `/admin` per usuaris sense rol admin.
- Bloquejar rutes `requiresSuperAdmin` si no té rol superadmin.

## Estat global (Pinia)

Stores principals (`src/stores/`):

- `vehicleStore`: catàleg i detall de vehicles + getters per estat.
- `bookingStore`: cicle complet de reserves + càlcul de preu + cancel·lació.

Patró recurrent:

- estat reactiu (`loading`, `error`, dades),
- getters derivats,
- accions async contra API.

## API client i interceptors

`src/services/api.ts`:

- determina `baseURL` segons entorn (domini vs local),
- injecta `Authorization: Bearer ...` des de cookie `token`,
- injecta `X-Tenant` segons prioritat:
  1) header explícit de la request,
  2) subdomini (preferit),
  3) cookie/localStorage.

## Internacionalització

`src/i18n/index.ts` concentra missatges per:

- `ca`, `es`, `en`,
- seccions de UI (mapa, reserves, perfil, admin, tiquets, etc.).

Beneficis:

- textos de UI centralitzats,
- consistència entre pantalles,
- escalabilitat en idiomes.
