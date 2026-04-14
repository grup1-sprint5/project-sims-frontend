# 1) Visió general

## Què és SIMS

SIMS és una plataforma web de mobilitat compartida orientada a entorns multi-tenant (empreses/organitzacions) amb dos grans espais:

- Espai **client**: reservar vehicles, consultar estat de reserves i gestionar perfil.
- Espai **administració**: gestionar flota, usuaris, rols, empreses/tenants, reserves i tiquets.

També incorpora:

- **Mapa en temps real** de vehicles (Leaflet).
- **Sistema de tiquets** de suport.
- **Assistent de xat IA** integrat al frontend client.
- **Landing page** comercial per presentar el producte.

## Problema que resol

La plataforma centralitza en un únic lloc:

- disponibilitat i localització de vehicles,
- procés de reserva (alta, consulta, cancel·lació),
- suport a usuaris (tiquets + conversa),
- governança operativa per administradors,
- separació de dades per organització (tenancy).

## Perfil d'usuaris

- **Client**: usa vehicles, crea reserves, obre tiquets i consulta historial.
- **Admin**: administra operativa del seu tenant (flota, usuaris, reserves, tiquets).
- **Super-admin**: supervisió global multi-tenant (segons rutes/meta del projecte).

## Capacitats clau (resum executiu)

- Multi-idioma (`ca`, `es`, `en`) amb diccionaris centralitzats.
- Navegació protegida per autenticació i rol.
- Integració API via Axios amb `Authorization` + `X-Tenant`.
- Detecció de tenant per subdomini i fallback per cookie/localStorage.
- UI moderna amb Vue 3 + Tailwind i notificacions toast.
