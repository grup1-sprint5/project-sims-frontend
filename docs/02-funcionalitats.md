# 2) Funcionalitats per mòdul

## Mòdul comú

- **Home / App Layout**: shell principal després de login.
- **Landing** (`/landing`): pàgina comercial amb hero, captures i CTA.
- **Mapa públic d'ús app** (`/vehicles-map`): vista de vehicles per client.
- **Notificacions**: via `vue3-toastify` amb comportament adaptat a mòbil.
- **Canvi d'idioma**: component de `LanguageSwitcher` + diccionari `i18n`.

## Autenticació (`/login`, `/register`, `/auth/callback`)

- Login amb tenant + credencials.
- Flux centralitzat (domini central) amb redirecció a subdomini tenant.
- Intercanvi de `exchange_token` per token final a `AuthCallback`.
- Persistència de sessió en cookies (`token`, `tenant`).
- `fetchUser()` per hidratar l'usuari autenticat.

## Client

### Reserves

- Llistat de reserves (`/bookings`).
- Alta de reserva (`/bookings/new`).
- Detall de reserva (`/bookings/:id`).
- Cancel·lació de reserva i refresc de llistat.
- Càlcul de preu estimat abans de confirmar reserva.

### Perfil

- Edició de dades personals.
- Canvi de contrasenya.

### Favorits i sensors

- Rutes i pàgines específiques disponibles (`/favoritos`, `/sensors`).

### Assistent IA (widget de xat)

- Botó flotant a la UI.
- Enviament de missatges al backend (`POST /chat`).
- Historial curt de context (últims missatges) per resposta més coherent.

## Admin (`/admin`)

- **Dashboard** de control.
- **Mapa admin** (`/admin/map`) per visualitzar flota.
- **Vehicles**: llistat, detall, alta/edició/eliminació (segons mòdul).
- **Usuaris**: gestió d'usuaris del tenant.
- **Rols**: gestió de rols/permisos.
- **Tenants**: gestió d'empreses (especialment en vista global/super-admin).
- **Reserves**: visió administrativa i detall (`/admin/bookings`, `/admin/bookings/:id`).
- **Tiquets**: gestió de suport (`/admin/tickets`, detall).

## Tiquets (suport)

- Llistat de tiquets.
- Creació de tiquet nou.
- Conversa dins del tiquet (missatges).
- Tancar/reobrir o actualitzar estat (segons permisos).
