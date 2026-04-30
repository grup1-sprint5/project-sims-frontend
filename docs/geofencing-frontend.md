# Geofencing frontend integration

## New admin routes

- `/admin/geofences`
- `/admin/geofences/create`
- `/admin/geofences/:id`
- `/admin/geofences/:id/edit`
- `/admin/geofence-events`

## Implemented screens

1. **Geofences list**
   - Filters: `active`, `name`, `assign_type`, `assign_id`
   - CRUD actions: create, edit, delete, detail

2. **Geofence form**
   - Supports `type=polygon` and `type=circle`
   - Rule and activation controls (`rule_type`, `active`, `hysteresis_m`)
   - Optional schedule block (`timezone`, `days[]`, `start`, `end`)
   - Client-side validation aligned with backend contract

3. **Geofence detail**
   - Assignment management (`vehicle` or `fleet`)
   - Vehicle selector from existing vehicles module
   - Leaflet map overlay for geofence + recent event markers
   - Debug panel for `/api/vehicle-positions`

4. **Geofence events**
   - Filters: `vehicle_id`, `geofence_id`, `from`, `to`, `event_type`
   - Visual badge by type:
     - `enter` green
     - `exit` slate/blue
     - `violation` red
   - Pagination + loading/error handling

## API endpoints used

- `GET /api/geofences`
- `POST /api/geofences`
- `GET /api/geofences/{id}`
- `PATCH /api/geofences/{id}`
- `DELETE /api/geofences/{id}`
- `POST /api/geofences/{id}/assignments`
- `DELETE /api/geofences/{id}/assignments/{assignmentId}`
- `GET /api/geofence-events`
- `POST /api/vehicle-positions`

> Requests use the existing Axios client (`src/services/api.ts`) so `Authorization` and `X-Tenant` are automatically attached from token/cookie/domain context.

## QA payload examples

### Create polygon geofence

```json
{
  "name": "Warehouse perimeter",
  "type": "polygon",
  "rule_type": "forbid",
  "active": true,
  "hysteresis_m": 12,
  "coordinates": [[2.171, 41.382], [2.176, 41.382], [2.176, 41.386], [2.171, 41.386], [2.171, 41.382]],
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[2.171, 41.382], [2.176, 41.382], [2.176, 41.386], [2.171, 41.386], [2.171, 41.382]]]
  },
  "schedule": {
    "timezone": "Europe/Madrid",
    "days": ["mon", "tue", "wed", "thu", "fri"],
    "start": "08:00",
    "end": "18:00"
  }
}
```

### Create circle geofence

```json
{
  "name": "City center",
  "type": "circle",
  "rule_type": "allow",
  "active": true,
  "hysteresis_m": 8,
  "center": { "lat": 41.38512, "lng": 2.1735 },
  "radius_m": 350,
  "circle": {
    "center": { "lat": 41.38512, "lng": 2.1735 },
    "radius_m": 350
  }
}
```

### Create assignment

```json
{
  "assign_type": "vehicle",
  "assign_id": "12"
}
```

### Ingest position (debug panel)

```json
{
  "vehicle_id": 12,
  "lat": 41.38512,
  "lng": 2.1735,
  "timestamp": "2026-04-23T16:20:00Z",
  "metadata": {
    "source": "admin-debug",
    "accuracy_m": 8
  }
}
```
