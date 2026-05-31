# Database ER Diagram

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ PaymentMethod : owns
    Restaurant ||--o{ MenuItem : has
    Order ||--o{ OrderItem : contains
    MenuItem ||--o{ OrderItem : referenced_by
    Order ||--o| Payment : has
    PaymentMethod ||--o{ Payment : used_in

    User {
        uuid id PK
        string name
        string email UK
        string password
        enum role
        enum country
        datetime createdAt
    }

    Restaurant {
        uuid id PK
        string name
        string description
        enum country
        datetime createdAt
    }

    MenuItem {
        uuid id PK
        uuid restaurantId FK
        string name
        string description
        decimal price
        string imageUrl
    }

    Order {
        uuid id PK
        uuid userId FK
        enum status
        decimal totalAmount
        enum country
        datetime createdAt
    }

    OrderItem {
        uuid id PK
        uuid orderId FK
        uuid menuItemId FK
        int quantity
        decimal price
    }

    PaymentMethod {
        uuid id PK
        uuid userId FK
        string cardHolder
        string cardNumberMasked
        string expiryDate
    }

    Payment {
        uuid id PK
        uuid orderId FK UK
        uuid paymentMethodId FK
        decimal amount
        enum status
    }
```

## Enums

- **Role:** ADMIN, MANAGER, MEMBER
- **Country:** GLOBAL, INDIA, AMERICA
- **OrderStatus:** DRAFT, PLACED, PAID, CANCELLED
- **PaymentStatus:** PENDING, SUCCESS, FAILED

## Country Isolation

`Restaurant.country` and `Order.country` drive row-level filtering. Users with `GLOBAL` (Admin) see all rows; others are restricted to their assigned country.
