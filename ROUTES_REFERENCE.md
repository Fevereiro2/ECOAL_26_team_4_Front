# ECOAL API and Web Routes Reference

Source used:
- `php artisan route:list --json`
- `openapi.yaml`
- `routes/api.php` and `routes/web.php`

## API v1 (base: `/api/v1`)

Response convention (most API endpoints):
- Success with payload: JSON object with `data`.
- Validation errors: JSON with `message`, `status`, `errors`.
- Generic errors: JSON with `message`, `status`.

### Auth

| Method | Path | Auth | Returned content |
|---|---|---|---|
| POST | /api/v1/register | Public | `201` JSON: `data.access_token`, `data.token_type`, `data.user` |
| POST | /api/v1/login | Public | `200` JSON: `data.access_token`, `data.token_type`, `data.user` |
| POST | /api/v1/forgot-password | Guest | `200` JSON: `data.message` |
| POST | /api/v1/reset-password | Guest | `200` JSON: `data.message` |
| POST | /api/v1/logout | Sanctum | `200` JSON: `data.message` |
| GET | /api/v1/user | Sanctum | `200` JSON: `data` = authenticated user (+ `collection`) |

### Users

| Method | Path | Auth | Returned content |
|---|---|---|---|
| GET | /api/v1/users | Public | `200` paginated JSON: `data[]` public users, `links`, `meta` |
| POST | /api/v1/users | Sanctum | `201` JSON: `data` created user |
| GET | /api/v1/users/{user} | Public | `200` JSON: `data` public user profile |
| PUT | /api/v1/users/{user} | Sanctum | `200` JSON: `data` updated user |
| PATCH | /api/v1/users/{user} | Sanctum | `200` JSON: `data` updated user |
| DELETE | /api/v1/users/{user} | Sanctum | `204` no content |

### Collections

| Method | Path | Auth | Returned content |
|---|---|---|---|
| GET | /api/v1/collections | Public | `200` paginated JSON: `data[]` collections, `links`, `meta` |
| POST | /api/v1/collections | Sanctum | `201` JSON: `data` created collection |
| GET | /api/v1/collections/{collection} | Public | `200` JSON: `data` collection detail (+ items) |
| PUT | /api/v1/collections/{collection} | Sanctum | `200` JSON: `data` updated collection |
| PATCH | /api/v1/collections/{collection} | Sanctum | `200` JSON: `data` updated collection |
| DELETE | /api/v1/collections/{collection} | Sanctum | `204` no content |

### Categories

| Method | Path | Auth | Returned content |
|---|---|---|---|
| GET | /api/v1/categories | Public | `200` paginated JSON: `data[]` categories, `links`, `meta` |
| POST | /api/v1/categories | Sanctum + role `admin|editor` | `201` JSON: `data` created category |
| GET | /api/v1/categories/{category} | Public | `200` JSON: `data` category |
| PUT/PATCH | /api/v1/categories/{category} | Sanctum + role `admin|editor` | `200` JSON: `data` updated category |
| DELETE | /api/v1/categories/{category} | Sanctum + role `admin|editor` | `204` no content |

### Criteria

| Method | Path | Auth | Returned content |
|---|---|---|---|
| GET | /api/v1/criteria | Public | `200` paginated JSON: `data[]` criteria, `links`, `meta` |
| POST | /api/v1/criteria | Sanctum + role `admin|editor` | `201` JSON: `data` created criterion |
| GET | /api/v1/criteria/{criterion} | Public | `200` JSON: `data` criterion |
| PUT/PATCH | /api/v1/criteria/{criterion} | Sanctum + role `admin|editor` | `200` JSON: `data` updated criterion |
| DELETE | /api/v1/criteria/{criterion} | Sanctum + role `admin|editor` | `204` no content |

### Items

| Method | Path | Auth | Returned content |
|---|---|---|---|
| GET | /api/v1/items | Public | `200` paginated JSON: `data[]` items (+ `collection`, `categories`, `criteria`), `links`, `meta` |
| POST | /api/v1/items | Sanctum | `201` JSON: `data` created item |
| GET | /api/v1/items/{item} | Public | `200` JSON: `data` item detail |
| PUT/PATCH | /api/v1/items/{item} | Sanctum | `200` JSON: `data` updated item |
| DELETE | /api/v1/items/{item} | Sanctum | `204` no content |

### Item-Criteria

| Method | Path | Auth | Returned content |
|---|---|---|---|
| GET | /api/v1/item-criteria | Public | `200` paginated JSON: `data[]` item scores, `links`, `meta` |
| POST | /api/v1/item-criteria | Sanctum | `201` JSON: `data` created score |
| GET | /api/v1/items/{item}/criteria | Public | `200` paginated JSON: scores for this item |
| PUT | /api/v1/items/{item}/criteria/{criterion} | Sanctum | `200` JSON: `data` updated score |
| DELETE | /api/v1/items/{item}/criteria/{criterion} | Sanctum | `204` no content |

## Web and framework routes

| Method | Path | Returned content |
|---|---|---|
| GET | / | HTML view `welcome` |
| GET | /docs | HTML view `docs` if docs enabled, otherwise `404` |
| GET | /docs/openapi.yaml | Raw `openapi.yaml` file (`application/yaml`) if docs enabled, otherwise `404` |
| GET | /health/live | JSON live status: `status`, `app`, `version`, `environment`, `timestamp` |
| GET | /health/ready | JSON readiness status + DB check (`checks.database.status`), may return `503` on DB failure |
| GET | /sanctum/csrf-cookie | Sanctum CSRF cookie endpoint (sets CSRF cookie/session context) |
| GET | /storage/{path} | Framework file serving endpoint (local storage) |
| PUT | /storage/{path} | Framework file upload endpoint (local storage) |
| GET | /up | Framework uptime/health endpoint |

## Common error statuses

- `401`: Unauthenticated (missing/invalid token)
- `403`: Forbidden (policy/role denied)
- `404`: Resource not found
- `409`: Conflict (duplicate item-criterion score)
- `422`: Validation failed
