# ECOAL API - Route Reference for Front Debug

Generated on: 2026-03-12
Base URL to use: /api/v1

This document lists all API routes, what each route does, and what it returns.
Examples below were validated locally after running:
- php artisan migrate:refresh --seed
- php artisan serve --host=127.0.0.1 --port=8000

## Quick integration checks for frontend

- Use /api/v1, not /api and not /v1.
- Send header Accept: application/json on all requests.
- Send header Authorization: Bearer <token> for protected routes.
- If frontend uses /api/users (legacy), API returns 404 because legacy routes are disabled.

Observed examples:
- GET /api/users -> 404 {"message":"The route api/users could not be found.","status":404}
- GET /api/v1/user without token -> 401 {"message":"Unauthenticated.","status":401}

## Response conventions

- Most success responses use {"data": ...}
- List endpoints return pagination keys: data, links, meta
- Validation errors return:
  - message
  - status
  - errors (field-by-field)
- Some errors are custom from ApiResponse and return:
  - message
  - status

Example validation error:

```json
{
  "message": "The given data was invalid.",
  "status": 422,
  "errors": {
    "email": [
      "The email field must be a valid email address."
    ]
  }
}
```

## Public auth routes

### POST /api/v1/register
Function: Create user account and return auth token.
Returns: 201 with token and user profile.

Example:

```json
{
  "data": {
    "access_token": "1|...",
    "token_type": "Bearer",
    "user": {
      "id": 6,
      "name": "New User",
      "email": "new@example.com",
      "avatar_url": null,
      "nationality": null,
      "is_active": true,
      "user_type": "user"
    }
  }
}
```

### POST /api/v1/login
Function: Authenticate and return auth token.
Returns: 200 with token and user profile.

Tested example:

```json
{
  "data": {
    "access_token": "1|<example_token>",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "name": "Jean Dupont",
      "email": "jean.dupont@email.com",
      "avatar_url": null,
      "nationality": "France",
      "is_active": true,
      "user_type": "admin"
    }
  }
}
```

Invalid credentials: 401

```json
{
  "message": "Invalid login details",
  "status": 401
}
```

### POST /api/v1/forgot-password
Function: Send password reset email.
Returns: 200 with success message.

```json
{
  "data": {
    "message": "We have emailed your password reset link."
  }
}
```

### POST /api/v1/reset-password
Function: Reset password using token.
Returns: 200 with success message.

```json
{
  "data": {
    "message": "Your password has been reset."
  }
}
```

## Public read routes

### GET /api/v1/users
Function: Paginated public user list.
Query params: name, nationality, sort(id|name|nationality), direction(asc|desc), per_page(max 100)
Returns: paginated UserPublicResource list.

Tested example (per_page=2):

```json
{
  "data": [
    {
      "id": 1,
      "name": "Jean Dupont",
      "email": "jean.dupont@email.com",
      "avatar_url": null,
      "nationality": "France",
      "user_type": "admin",
      "collection": {
        "id": 1,
        "title": "Jean's Collection",
        "description": "My personal collection of vintage and modern lighters",
        "user_id": 1
      }
    }
  ],
  "links": {
    "first": "http://127.0.0.1:8000/api/v1/users?per_page=2&page=1",
    "last": "http://127.0.0.1:8000/api/v1/users?per_page=2&page=3",
    "prev": null,
    "next": "http://127.0.0.1:8000/api/v1/users?per_page=2&page=2"
  },
  "meta": {
    "current_page": 1,
    "per_page": 2,
    "total": 5
  }
}
```

### GET /api/v1/users/{user}
Function: Public user details by id.
Returns: UserPublicResource in data.

### GET /api/v1/collections
Function: Paginated list of collections with user and items relation loaded.
Query params: user_id, title, sort(id|title|user_id), direction, per_page
Returns: paginated CollectionResource list.

### GET /api/v1/collections/{collection}
Function: Collection detail with user and items.
Returns: CollectionResource.

Tested example (/collections/1):

```json
{
  "data": {
    "id": 1,
    "title": "Jean's Collection",
    "description": "My personal collection of vintage and modern lighters",
    "user_id": 1,
    "user": {
      "id": 1,
      "name": "Jean Dupont",
      "avatar_url": null,
      "nationality": "France"
    },
    "items": [
      {
        "id": 1,
        "title": "Zippo 1941 Replica",
        "description": "Faithful replica of the 1941 military Zippo in brushed brass. Refillable with lighter fluid.",
        "image_url": "https://example.com/images/zippo-1941.jpg",
        "status": true,
        "collection_id": 1,
        "category1_id": 1,
        "category2_id": 6
      }
    ]
  }
}
```

### GET /api/v1/categories
Function: Paginated list of categories.
Query params: title, sort(id|title), direction, per_page
Returns: paginated CategoryResource list.

Tested example:

```json
{
  "data": [
    {"id": 1, "title": "Spark wheel"},
    {"id": 2, "title": "Piezoelectric"}
  ]
}
```

### GET /api/v1/categories/{category}
Function: Category details.
Returns: CategoryResource.

### GET /api/v1/items
Function: Paginated list of items with collection, category1, category2, criteria.
Query params: collection_id, category1_id, category2_id, status, title, sort(id|title|collection_id|created_at), direction, per_page
Returns: paginated ItemResource list.

Tested example (per_page=2):

```json
{
  "data": [
    {
      "id": 1,
      "title": "Zippo 1941 Replica",
      "description": "Faithful replica of the 1941 military Zippo in brushed brass. Refillable with lighter fluid.",
      "image_url": "https://example.com/images/zippo-1941.jpg",
      "status": true,
      "collection_id": 1,
      "category1_id": 1,
      "category2_id": 6,
      "collection": {
        "id": 1,
        "title": "Jean's Collection",
        "description": "My personal collection of vintage and modern lighters",
        "user_id": 1
      },
      "category1": {"id": 1, "title": "Spark wheel"},
      "category2": {"id": 6, "title": "Vintage (1920-1970)"},
      "criteria": [
        {"id_criteria": 1, "name": "Durability", "score": 2, "pivot": {"score": 2}},
        {"id_criteria": 2, "name": "Price", "score": 2, "pivot": {"score": 2}}
      ]
    }
  ],
  "links": {"next": "http://127.0.0.1:8000/api/v1/items?per_page=2&page=2"},
  "meta": {"current_page": 1, "per_page": 2, "total": 12}
}
```

### GET /api/v1/items/{item}
Function: Item details with all relations loaded.
Returns: ItemResource.

### GET /api/v1/criteria
Function: Paginated criteria list.
Query params: name, sort(id_criteria|name), direction, per_page
Returns: paginated CriteriaResource list.

Tested example:

```json
{
  "data": [
    {"id_criteria": 1, "name": "Durability"},
    {"id_criteria": 2, "name": "Price"}
  ]
}
```

### GET /api/v1/criteria/{criterion}
Function: Criteria details.
Returns: CriteriaResource.

### GET /api/v1/item-criteria
Function: Paginated scores item <-> criterion with linked item and criterion.
Query params: id_item, id_criteria, value, sort(id_item|id_criteria|value), direction, per_page
Returns: paginated ItemCriteriaResource list.

Tested example:

```json
{
  "data": [
    {
      "id_item": 1,
      "id_criteria": 1,
      "value": 2,
      "item": {
        "id": 1,
        "title": "Zippo 1941 Replica",
        "collection_id": 1,
        "category1_id": 1,
        "category2_id": 6
      },
      "criteria": {
        "id_criteria": 1,
        "name": "Durability"
      }
    }
  ]
}
```

### GET /api/v1/items/{item}/criteria
Function: Paginated scores for one item only.
Query params: per_page
Returns: paginated ItemCriteriaResource list (criteria relation loaded).

Tested example:

```json
{
  "data": [
    {
      "id_item": 1,
      "id_criteria": 1,
      "value": 2,
      "criteria": {
        "id_criteria": 1,
        "name": "Durability"
      }
    }
  ]
}
```

## Protected routes (Bearer token required)

### POST /api/v1/logout
Function: Revoke current token.
Returns: 200 with message.

```json
{
  "data": {
    "message": "Successfully logged out"
  }
}
```

### GET /api/v1/user
Function: Return authenticated user profile with collection loaded.
Returns: UserResource.

Tested example:

```json
{
  "data": {
    "id": 1,
    "name": "Jean Dupont",
    "email": "jean.dupont@email.com",
    "avatar_url": null,
    "nationality": "France",
    "is_active": true,
    "user_type": "admin",
    "collection": {
      "id": 1,
      "title": "Jean's Collection",
      "description": "My personal collection of vintage and modern lighters",
      "user_id": 1
    }
  }
}
```

### POST /api/v1/users
Function: Create user (admin policy-controlled).
Returns: 201 UserResource.

### PUT/PATCH /api/v1/users/{user}
Function: Update user (policy + role logic in request/controller).
Returns: 200 UserResource.

### DELETE /api/v1/users/{user}
Function: Delete user.
Returns: 204 no content.

### POST /api/v1/collections
Function: Create collection for current user only (max one collection per user).
Returns:
- 201 CollectionResource on success
- 403 {"message":"User already has a collection.","status":403} if user already has one

### PUT/PATCH /api/v1/collections/{collection}
Function: Update collection (policy).
Returns: 200 CollectionResource.

### DELETE /api/v1/collections/{collection}
Function: Delete collection (policy).
Returns: 204 no content.

### POST /api/v1/items
Function: Create item in authenticated user collection (collection_id auto-assigned).
Returns:
- 201 ItemResource on success
- 403 {"message":"You must create a collection first before adding items.","status":403} if no collection

### PUT/PATCH /api/v1/items/{item}
Function: Update item (policy).
Returns: 200 ItemResource.

### DELETE /api/v1/items/{item}
Function: Delete item (policy).
Returns: 204 no content.

### POST /api/v1/item-criteria
Function: Create score (item, criterion, value).
Returns:
- 201 ItemCriteriaResource
- 409 {"message":"A score already exists for this item and criterion.","status":409} on duplicate pair

### PUT /api/v1/items/{item}/criteria/{criterion}
Function: Update score for one item + criterion pair.
Returns: 200 ItemCriteriaResource.

### DELETE /api/v1/items/{item}/criteria/{criterion}
Function: Delete score for one pair.
Returns:
- 204 no content on success
- 404 {"message":"Score not found for this item and criterion.","status":404}

## Protected routes with role gate (admin,editor)

### POST /api/v1/categories
### PUT/PATCH /api/v1/categories/{category}
### DELETE /api/v1/categories/{category}
Function: Manage categories.
Returns: CategoryResource for create/update, 204 for delete.

### POST /api/v1/criteria
### PUT/PATCH /api/v1/criteria/{criterion}
### DELETE /api/v1/criteria/{criterion}
Function: Manage criteria.
Returns: CriteriaResource for create/update, 204 for delete.

## Non-API utility routes (can help debug infra)

### GET /health/live
Function: Liveness probe.
Returns:

```json
{
  "status": "ok",
  "app": "Laravel",
  "version": "dev",
  "environment": "local",
  "timestamp": "2026-03-12T09:44:34+00:00"
}
```

### GET /health/ready
Function: Readiness probe (checks DB connection).
Returns: 200 if DB ok, 503 if DB failure.

## Front debug checklist

- Confirm frontend API base URL is exactly /api/v1.
- Confirm frontend sends Accept: application/json.
- Confirm Bearer token is attached after login for protected routes.
- If browser calls are blocked, check CORS_ALLOWED_ORIGINS in .env and config/cors.php.
- For pagination lists, frontend should read data array plus links/meta for navigation.
