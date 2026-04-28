# Set-up de l'entorn de testeig

Aquest document descriu com preparar l'entorn local per validar el projecte abans de fer canvis o desplegar.

## Objectiu

Deixar el projecte llest per:

- Arrencar el frontend i el backend en local.
- Carregar dades de prova.
- Executar les proves bàsiques de verificació.

## Requisits previs

Abans de començar, assegura't de tenir instal·lat:

- Docker i Docker Compose.
- Node.js 20 o superior.
- npm.
- PHP 8.2 o superior si vols executar el backend fora de Docker.
- Composer si treballes sense contenidor.

Si fas servir Docker, no cal instal·lar PostgreSQL ni MongoDB manualment.

## Ports habituals

- Frontend: `5173`
- Backend: `8001`
- PostgreSQL: `5433` o el valor configurat a `DB_HOST_PORT`
- pgAdmin: `8080`
- MongoDB: `27017`

## Variables d'entorn

### Frontend

El frontend usa principalment aquestes variables:

- `VITE_API_URL`: URL base del backend, per exemple `http://localhost:8001`.
- `VITE_FORCE_CENTRAL_LOGIN`: força el flux de login central si està activat.
- `VITE_CENTRAL_HOSTNAMES`: llista d'hostnames centrals separats per comes.

### Backend

Revisa com a mínim aquestes variables al `.env`:

- `APP_URL`
- `DB_CONNECTION`
- `DB_HOST`
- `DB_PORT`
- `DB_DATABASE`
- `DB_USERNAME`
- `DB_PASSWORD`
- `MONGODB_URI`
- `MONGODB_DATABASE`
- `IA_API_URL`
- `IA_API_KEY`
- `IA_MODEL`

Si canvies variables d'entorn, reinicia els contenidors o neteja la configuració cachejada.

## Arrencada recomanada

### 1. Backend

Des de la carpeta `project-sims-backend`:

```bash
docker compose up -d --build
docker compose exec app composer install --no-interaction
docker compose exec app php artisan key:generate --force
docker compose exec app php artisan migrate --force
docker compose exec app php artisan tenants:migrate --no-interaction
docker compose exec app php artisan tenants:seed --class="Database\\Seeders\\DatabaseSeeder" --force --no-interaction
```

Si necessites regenerar dades de demo després d'un pull, repeteix les migracions i el seed.

### 2. Frontend

Des de la carpeta `project-sims-frontend`:

```bash
npm install
npm run dev
```

Si treballes amb Docker al frontend, pots usar el `docker-compose.yml` del projecte:

```bash
docker compose up -d --build
```

## Validació ràpida

Quan l'entorn estigui aixecat, comprova això:

1. Obre `http://localhost:5173`.
2. Verifica que el backend respon a `http://localhost:8001`.
3. Fes login amb un usuari de prova.
4. Revisa que el mapa, les reserves, els tiquets i el chatbot carreguen.

## Execució de proves

### Frontend

```bash
npm run build
npm run type-check
```

### Backend

Des de `project-sims-backend`:

```bash
docker compose exec app php artisan test
```

El fitxer `phpunit.xml` del backend ja configura l'entorn de testing amb SQLite en memòria, de manera que les proves no depenen de la base de dades de desenvolupament.

## Flux de prova recomanat

1. Arrenca el backend i comprova que les migracions s'han aplicat.
2. Arrenca el frontend i valida que el login funciona.
3. Navega per mapa, reserves, tiquets i perfil.
4. Executa build i tests abans de pujar canvis.

## Problemes habituals

### El frontend no troba el backend

- Revisa `VITE_API_URL`.
- Confirma que el backend està actiu a `http://localhost:8001`.
- Neteja la cache del navegador si encara veu una URL antiga.

### El backend no veu les dades

- Repassa que PostgreSQL i MongoDB estiguin en marxa.
- Torna a executar migracions i seeders.
- Si has canviat `.env`, executa `php artisan config:clear`.

### Error amb dependències del frontend dins Docker

- Torna a instal·lar paquets al contenidor del frontend.
- Si cal, recrea el volum de `node_modules`.

### El chatbot IA falla

- Verifica `IA_API_URL`, `IA_API_KEY` i `IA_MODEL`.
- Comprova que el servei IA és accessible des del backend.

## Comanda ràpida de comprovació

Si vols un check curt després d'un pull, executa:

```bash
# Backend
docker compose exec app php artisan migrate --force
docker compose exec app php artisan tenants:migrate --no-interaction
docker compose exec app php artisan tenants:seed --class="Database\\Seeders\\DatabaseSeeder" --force --no-interaction
docker compose exec app php artisan test

# Frontend
npm run build
npm run type-check
```
