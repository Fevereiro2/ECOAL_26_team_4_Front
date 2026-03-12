# API Routes — ECOAL / Light It

Base URL: `http://127.0.0.1:8000/api/v1`

All requests include `Accept: application/json`.  
When a body is sent, `Content-Type: application/json` is added automatically.  
Authenticated routes require `Authorization: Bearer <token>`.

---

## Summary

| Route            | Methods      | Auth Required            |
| ---------------- | ------------ | ------------------------ |
| `/login`         | POST         | No                       |
| `/register`      | POST         | No                       |
| `/logout`        | POST         | Yes (Bearer token)       |
| `/users`         | GET          | No                       |
| `/users/{id}`    | PUT, DELETE  | Yes (Bearer token)       |
| `/items`         | GET, POST    | GET: No — POST: Yes      |
| `/items/{id}`    | PUT, DELETE  | Yes (Bearer token)       |

---

## Detailed Routes

### 1. Authentication

#### `POST /login`

- **Auth:** None
- **Used in:** `App.jsx`
- **Request body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Expected response:**
```json
{
  "data": {
    "access_token": "string",
    "user": { ApiUser }
  }
}
```

---

#### `POST /register`

- **Auth:** None
- **Used in:** `App.jsx`
- **Request body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "password_confirmation": "string"
}
```
- **Expected response:** Same shape as `/login`.

---

#### `POST /logout`

- **Auth:** Bearer token
- **Used in:** `App.jsx`
- **Request body:** None
- **Expected response:** No body processed (fire-and-forget).

---

### 2. Users

#### `GET /users`

- **Auth:** None
- **Used in:** `App.jsx` (bootstrap data load)
- **Request body:** None
- **Expected response:** An array of `ApiUser` objects, wrapped in one of these shapes:
```json
{ "data": [ ApiUser, ... ] }
// or
{ "users": [ ApiUser, ... ] }
// or
[ ApiUser, ... ]
```

**`ApiUser` expected fields:**
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "user_type": "admin | user",
  "avatar_url": "string | null",
  "bio": "string | null",
  "nationality": "string | null",
  "collection": {
    "description": "string | null"
  }
}
```

---

#### `PUT /users/{id}`

- **Auth:** Bearer token
- **Used in:** `ProfileScreen.jsx` (self-edit + admin edit)
- **Request body (self-edit):**
```json
{
  "name": "string",
  "email": "string",
  "password": "string (optional, omit if unchanged)",
  "avatar_url": "string",
  "nationality": "string"
}
```
- **Request body (admin edit):**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "user_type": "admin | user"
}
```
- **Expected response:** Updated `ApiUser` object (same fields as above), wrapped in `{ "data": ApiUser }` or bare.

---

#### `DELETE /users/{id}`

- **Auth:** Bearer token
- **Used in:** `ProfileScreen.jsx` (admin deleting a user)
- **Request body:** None
- **Expected response:** Any (no body processed — success = removal from local state).

---

### 3. Items (Lighters)

#### `GET /items`

- **Auth:** None
- **Used in:** `App.jsx` (bootstrap data load)
- **Request body:** None
- **Expected response:** An array of `ApiItem` objects, wrapped in one of these shapes:
```json
{ "data": [ ApiItem, ... ] }
// or
{ "items": [ ApiItem, ... ] }
// or
[ ApiItem, ... ]
```

**`ApiItem` expected fields:**
```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "image_url": "string",
  "status": "boolean (true = public, false = private)",
  "collection_id": "number",
  "collection": {
    "user_id": "number"
  },
  "category1": {
    "name": "string",
    "title": "string (alternative)"
  },
  "category2": {
    "name": "string",
    "title": "string (alternative)"
  },
  "criteria": [
    {
      "pivot": { "score": "number (0-10)" }
    }
  ]
}
```

**Criteria order (by array index):**
| Index | Criterion  |
| ----- | ---------- |
| 0     | Durability |
| 1     | Value      |
| 2     | Rarity     |
| 3     | Autonomy   |

---

#### `POST /items`

- **Auth:** Bearer token
- **Used in:** `ProfileScreen.jsx`, `VaultScreen.jsx`
- **Request body:**
```json
{
  "title": "string",
  "description": "string",
  "image_url": "string",
  "status": "boolean (true = public)",
  "category1_id": "number",
  "category2_id": "number | null"
}
```
- **Expected response:** Created `ApiItem` object (same fields as GET), wrapped in `{ "data": ApiItem }` or bare.

---

#### `PUT /items/{id}`

- **Auth:** Bearer token
- **Used in:** `ProfileScreen.jsx`, `VaultScreen.jsx`
- **Request body:** Same as `POST /items`.
- **Expected response:** Updated `ApiItem` object (same fields as GET).

---

#### `DELETE /items/{id}`

- **Auth:** Bearer token
- **Used in:** `ProfileScreen.jsx`, `VaultScreen.jsx`
- **Request body:** None
- **Expected response:** Any (no body processed — success = removal from local state).

---

## Data Flow

```
Frontend                         Backend
────────                         ───────
App.jsx boot
  ├── GET /users ──────────────► returns all users
  └── GET /items ──────────────► returns all items (with relations)

AuthScreen
  ├── POST /login ─────────────► returns token + user
  └── POST /register ──────────► returns token + user

ProfileScreen (authenticated)
  ├── PUT  /users/{id} ────────► update self or admin edit
  ├── DELETE /users/{id} ──────► admin delete user
  ├── POST /items ─────────────► create lighter
  ├── PUT  /items/{id} ────────► update lighter
  └── DELETE /items/{id} ──────► delete lighter

VaultScreen (authenticated)
  ├── POST /items ─────────────► create lighter
  ├── PUT  /items/{id} ────────► update lighter
  └── DELETE /items/{id} ──────► delete lighter

Logout (any screen)
  └── POST /logout ────────────► invalidate token
```

---

## Important Notes

1. **Response wrapping:** The frontend handles multiple wrapping conventions (`{ data: [...] }`, `{ users: [...] }`, `{ items: [...] }`, or a bare array). The backend should ideally be consistent — prefer `{ data: [...] }`.

2. **Relations on items:** `GET /items` must eager-load `collection`, `category1`, `category2`, and `criteria` relationships. Without these, the mapper will fall back to defaults ("Uncategorized", "Unknown", score 5).

3. **Criteria scores:** The app reads `criteria[i].pivot.score` (pivot table from many-to-many). If the backend uses `criteria[i].score` directly, that also works.

4. **User type:** Must be `"admin"` or `"user"` (case-insensitive). The value `"editor"` is treated as `"admin"`.

5. **Status field:** The `status` field on items is treated as boolean. Truthy = public, falsy = private.
