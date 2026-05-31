# API Documentation

Base URL: `http://localhost:3001`

Interactive docs: `http://localhost:3001/api/docs` (Swagger)

## Authentication

All endpoints except `POST /auth/login` require:

```
Authorization: Bearer <access_token>
```

### POST /auth/login

**Body:**
```json
{ "email": "nick.fury@slooze.com", "password": "Password123!" }
```

**Response:**
```json
{
  "access_token": "<jwt>",
  "user": { "id", "name", "email", "role", "country" },
  "role": "ADMIN",
  "country": "GLOBAL"
}
```

## Users

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /users/me | Auth | Profile + permission list |

## Restaurants

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /restaurants | VIEW_RESTAURANTS | List (country-filtered) |
| GET | /restaurants/:id | VIEW_RESTAURANTS | Detail |

## Menu

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| GET | /menu-items | VIEW_MENU_ITEMS | List (?restaurantId) |
| GET | /menu-items/:id | VIEW_MENU_ITEMS | Detail |

## Orders

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | /orders | CREATE_ORDER | Create DRAFT order |
| GET | /orders | CREATE_ORDER | List orders |
| GET | /orders/:id | CREATE_ORDER | Order detail |
| POST | /orders/:id/items | ADD_FOOD_ITEMS | Add cart item |
| POST | /orders/:id/checkout | CHECKOUT_ORDER | DRAFT → PLACED |
| PATCH | /orders/:id/cancel | CANCEL_ORDER | Cancel order |

## Payments

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| POST | /payments | PAY_ORDER | Pay PLACED order |
| GET | /payment-methods | PAY_ORDER | List methods |
| PATCH | /payment-methods/:id | UPDATE_PAYMENT_METHOD | Admin only |

## Error Responses

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "You do not have permission to perform this action",
  "error": "Forbidden"
}
```

**401 Unauthorized:** Missing or invalid JWT.

## RBAC Matrix

| Function | Admin | Manager | Member |
|----------|-------|---------|--------|
| View Restaurants | ✓ | ✓ | ✓ |
| View Menu | ✓ | ✓ | ✓ |
| Create Order | ✓ | ✓ | ✓ |
| Add Items | ✓ | ✓ | ✓ |
| Checkout | ✓ | ✓ | ✗ |
| Pay | ✓ | ✓ | ✗ |
| Cancel | ✓ | ✓ | ✗ |
| Update Payment Method | ✓ | ✗ | ✗ |

## Country Rules

- **ADMIN (GLOBAL):** All countries
- **MANAGER/MEMBER:** Only their country (INDIA or AMERICA)
- **MEMBER:** Orders list scoped to own orders only
