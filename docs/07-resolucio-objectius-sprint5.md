# Resolució dels 4 Objectius Principals de l'Sprint 5

A continuació s'explica com hem abordat i resolt cadascun dels quatre objectius clau del projecte durant aquest sprint:

---

## 1. Versió alfa estable
- Hem desenvolupat totes les funcionalitats bàsiques requerides pel client: gestió de reserves, vehicles, incidències i autenticació multi-tenant.
- S'ha fet una primera integració completa entre el front-end (Vue 3 + Vite) i el back-end (Laravel API), assegurant la comunicació i la persistència de dades.
- El codi s'ha documentat i s'han afegit tests automatitzats per garantir l'estabilitat.
- S'ha desplegat la versió alfa en un entorn real per a proves i validació.

## 2. Integrar State Management
- S'ha investigat i comparat diverses llibreries de gestió d'estat (Vuex, Redux, Pinia).
- S'ha escollit **Pinia** per la seva integració nativa amb Vue 3, simplicitat i millor experiència de desenvolupament.
- S'han creat magatzems d'estat (stores) per a reserves, vehicles i autenticació, permetent compartir dades entre components sense duplicar peticions al servidor.
- Aquesta centralització ha millorat la coherència i el rendiment de l'aplicació.

## 3. Millores d'usabilitat
- S'han aplicat principis del llibre "Don't Make Me Think" per simplificar la navegació i la interacció.
- S'han revisat i millorat textos, botons i fluxos per fer-los més intuïtius.
- S'han realitzat tests d'usabilitat amb usuaris externs (companys, familiars) i s'han recollit feedbacks per fer ajustos.
- S'ha utilitzat Lighthouse per analitzar i optimitzar el rendiment i la resposta de l'aplicació.

## 4. Chatbot
- S'ha integrat un chatbot d'ajuda a l'aplicació, basat en la tecnologia RAG i connectat a la IA de l'institut.
- El chatbot utilitza documentació pròpia per respondre dubtes i guiar l'usuari segons el seu rol (Superadmin, Tenant Admin, Worker, Usuari final).
- Aquesta funcionalitat millora el suport i l'autonomia dels usuaris, reduint la necessitat d'assistència externa.

---

**Conclusió:**
Amb aquestes accions, hem assolit una versió alfa robusta, usable i preparada per a la validació real, amb una base sòlida per a futurs desenvolupaments i millores.