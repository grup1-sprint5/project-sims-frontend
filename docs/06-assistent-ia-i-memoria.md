# 6) Assistent IA i “memòria” (nivell conceptual)

## On és implementat

Frontend: `src/modules/client/components/ChatWidget.vue`

La conversa es representa amb:

- `messages: ChatMessage[]` (estat reactiu en memòria del navegador)
- peticions `POST /chat` al backend

## Com funciona actualment la memòria

Quan l'usuari envia un missatge:

1. S'afegeix el missatge d'usuari a `messages`.
2. Es construeix `history` amb els últims missatges previs (finestra curta).
3. Es crida `POST /chat` amb:
   - `message` (missatge actual)
   - `history` (context recent)
4. S'afegeix la resposta de l'assistent a `messages`.

### Implicació important

Des del frontend, la “memòria” és principalment:

- **memòria de sessió UI** (mentre la pàgina no es recarrega), i
- **context curt enviat al backend** a cada petició.

No hi ha evidència en frontend d'una persistència local permanent de conversa (per exemple `localStorage` o IndexedDB per historial complet).

## Per què una IA “té memòria” (explicació abstracta)

En productes de xat, la memòria pot venir de 3 nivells:

1. **Context immediat**: els últims missatges inclosos al prompt.
2. **Memòria de sessió**: estat temporal mentre dura la sessió actual.
3. **Memòria persistent**: dades guardades a backend/DB entre sessions.

En aquest frontend, veiem clarament (1) i (2). El nivell (3) dependrà de la implementació backend de `/chat`.

## Si voleu memòria persistent “real”

Caldria implementar (normalment al backend):

- identificador de conversa per usuari/tenant,
- emmagatzematge de missatges i resum de context,
- política de retenció (RGPD, privacitat, cost),
- controls per esborrar historial i exportar dades.
