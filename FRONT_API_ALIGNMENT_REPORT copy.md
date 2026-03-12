# FRONT/API Alignment Report - Minimal Working Integration

Generated on: 2026-03-12
API base path: /api/v1

Purpose: give frontend the exact contract and minimal changes needed so display + create + update + delete work reliably.

## 1) Backend fixes applied now (minimal compatibility)

The API was adjusted to match frontend expectations with minimal change:

- Item criteria now include score in both keys:
  - criteria[].score
  - criteria[].pivot.score
- GET /users now includes public fields often needed by front list/admin screens:
  - email
  - user_type
- POST /items now returns enriched item (not only ids):
  - collection (with user_id)
  - category1
  - category2
  - criteria
- PUT /items/{id} now returns the same enriched item shape as POST/GET.
- PUT /items/{item}/criteria/{criterion} now returns relations (item + criteria), not only raw ids.
- PUT/PATCH /users/{id} now reloads and returns collection too.

Result: frontend can update local state directly from create/update responses without re-fetching full lists.

## 2) Minimal frontend rules to make app work

- Always call /api/v1/... (not /api/... and not /v1/...).
- Always send Accept: application/json.
- Send Authorization: Bearer <token> for protected routes.
- On list endpoints, read response.data as array and use response.meta/response.links for pagination.
- For item scores, support both shapes:
  - criteria[i].pivot.score
  - criteria[i].score

## 3) Route status and real return shapes

### Public routes used by frontend

- POST /api/v1/login
  - 200: { data: { access_token, token_type, user } }
  - 401: { message, status }
  - 422: { message, status, errors }

- POST /api/v1/register
  - 201: { data: { access_token, token_type, user } }
  - 422: { message, status, errors }

- GET /api/v1/users
  - 200: paginated
  - Shape: { data: UserPublic[], links, meta }
  - UserPublic now includes:
    - id, name, email, avatar_url, nationality, user_type, collection

- GET /api/v1/items
  - 200: paginated
  - Shape: { data: Item[], links, meta }
  - Item includes:
    - id, title, description, image_url, status
    - collection_id, category1_id, category2_id
    - collection { user_id, ... }
    - category1, category2
    - criteria[] with score + pivot.score

### Protected routes used by frontend (CRUD minimal)

- POST /api/v1/items
  - Auth required
  - 201: { data: Item } enriched (collection/category/criteria loaded)
  - 403 if user has no collection

- PUT/PATCH /api/v1/items/{id}
  - Auth required
  - 200: { data: Item } enriched

- DELETE /api/v1/items/{id}
  - Auth required
  - 204 no content

- PUT/PATCH /api/v1/users/{id}
  - Auth required + policy checks
  - 200: { data: User } (collection loaded)

- DELETE /api/v1/users/{id}
  - Auth required + policy checks
  - 204 no content

- POST /api/v1/logout
  - Auth required
  - 200: { data: { message } }

## 4) Confirmed working flow (tested)

- Login admin: OK (token received)
- GET users: OK (collection + email + user_type present)
- GET items: OK (collection.user_id + criteria[].pivot.score present)
- POST item: OK (201 with enriched item)
- PUT item: OK (200 with enriched item)
- DELETE item: OK (204)

## 5) Known differences frontend should accept

- Lists are paginated by default.
  - Expected wrapper is always { data, links, meta } for collections.
- category objects use title key (not guaranteed name).
  - Front should read category.name || category.title
- Criteria score values in this API are currently sourced from pivot value.
  - Front should read pivot.score first, fallback to score.

## 6) Most likely old blockers and fixes

- 404 on requests:
  - Cause: frontend calling /api/... instead of /api/v1/...
  - Fix: set API base to /api/v1

- 401 on protected requests:
  - Cause: missing Bearer token header
  - Fix: inject Authorization header after login

- Item ownership/visibility logic failing after create/update:
  - Cause: response previously missing collection relation
  - Fix: now solved in backend response shape

- Score rendering fallback to defaults:
  - Cause: frontend expecting pivot.score only
  - Fix: now solved by returning both pivot.score and score

## 7) Recommended frontend parser (minimal robust strategy)

- users = response.data ?? response.users ?? response
- items = response.data ?? response.items ?? response
- score = criterion.pivot?.score ?? criterion.score ?? 5
- categoryLabel = category.name ?? category.title ?? 'Unknown'

This strategy is enough to keep old code resilient while converging to strict API shape later.

## 8) Item image upload support

The API now supports three image input modes on POST /api/v1/items and PUT/PATCH /api/v1/items/{id}:

- image_url
  - Use this if frontend already has a remote URL.
- image
  - Send a real file with multipart/form-data.
  - Field name: image
- image_base64
  - Send a base64 string or a data URI.

When image or image_base64 is used, Laravel stores the file in storage/app/public/items and returns a final public URL in image_url, for example:

- http://127.0.0.1:8000/storage/items/example.png

Recommended frontend choice: use FormData with image for Expo Web when a user selects a local file.
