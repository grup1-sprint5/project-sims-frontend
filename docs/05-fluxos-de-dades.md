# 5) Fluxos de dades principals

## 1. Sessió d'usuari

1. Login correcte => token a cookie.
2. Interceptor Axios injecta `Authorization`.
3. Router guard detecta token i, si cal, executa `fetchUser()`.
4. Rutes protegides queden disponibles segons rol.

## 2. Flux de reserves (client)

Store implicat: `src/stores/bookingStore.ts`

- `fetchBookings()` -> `GET /reservations`.
- `createBooking()` -> `POST /reservations`.
- `cancelBooking()` -> `POST /reservations/:id/cancel`.
- `calculatePrice()` -> `POST /reservations/calculate-price`.

La UI consumeix getters (`pending`, `active`, `completed`, `cancelled`) per separar seccions visibles.

## 3. Flux de vehicles i mapa

Composables/store implicats:

- `vehicleStore.ts`
- `modules/map/composables/useMap.ts`

`useMap`:

- inicialitza Leaflet,
- carrega vehicles + reserves en paral·lel,
- calcula estat efectiu (`available`, `occupied`, `running`),
- crea marcadors amb icones per estat,
- aplica filtres (text, radi, operatius),
- fa polling periòdic per refrescar dades.

## 4. Flux de tiquets

Composable: `src/modules/tickets/composables/useTickets.ts`

- `getTickets()` -> `GET /tickets` (amb filtres)
- `getTicket(id)` -> `GET /tickets/:id`
- `createTicket(form)` -> `POST /tickets`
- `updateTicket(id, data)` -> `PUT /tickets/:id`
- `sendMessage(ticketId, msg)` -> `POST /tickets/:ticketId/messages`

## 5. Flux d'errors i feedback UI

- Errors d'API es propaguen a `error` reactiu o es llancen (`throw`) segons cas.
- Toasts informen l'usuari en errors operatius (xat, logout, etc.).
- Les pàgines reaccionen a `loading/sending` per mostrar estats d'espera.
