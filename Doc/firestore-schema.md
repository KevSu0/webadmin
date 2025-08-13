# Firestore Schema: Camera World E-commerce

This document outlines the Firestore database schema for the Camera World e-commerce application.

## Collections

### `users`

*   **Document ID:** `userId` (Firebase Auth UID)
*   **Description:** Stores user profile information, roles, and settings.

| Field | Type | Description |
| :--- | :--- | :--- |
| `uid` | `string` | The user's unique Firebase Authentication ID. |
| `email` | `string` | User's primary email address. |
| `displayName` | `string` | User's full name. |
| `phone` | `string` | (Optional) User's phone number. |
| `role` | `string` | User's role (`'customer'` or `'admin'`). |
| `addresses` | `array` | (Optional) A list of user's shipping addresses. |
| `status` | `string` | User's account status (`'active'`, `'inactive'`, `'suspended'`). |
| `createdAt` | `timestamp` | Timestamp of account creation. |
| `updatedAt` | `timestamp` | Timestamp of the last profile update. |

---

### `products`

*   **Document ID:** Auto-generated unique ID
*   **Description:** Stores all product information for the catalog.

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The name of the product. |
| `description` | `string` | A detailed description of the product. |
| `price` | `number` | The price of the product. |
| `categoryID` | `string` | The ID of the category this product belongs to (links to `categories` collection). |
| `stock` | `number` | The current stock quantity. |
| `isSecondhand` | `bool` | Flag indicating if the product is second-hand. |
| `specialistPhone`| `string` | Contact number for a specialist about this product. |
| `status` | `string` | The product's visibility status (`'active'`, `'inactive'`, `'draft'`). |
| `createdAt` | `timestamp` | Timestamp of product creation. |
| `updatedAt` | `timestamp` | Timestamp of the last product update. |

---

### `categories`

*   **Document ID:** Auto-generated unique ID
*   **Description:** Stores product categories.

| Field | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | The name of the category. |
| `description` | `string` | A short description of the category. |
| `status` | `string` | The category's visibility status (`'active'`, `'inactive'`, `'pending'`). |
| `createdAt` | `timestamp` | Timestamp of category creation. |
| `updatedAt` | `timestamp` | Timestamp of the last category update. |

---

### `orders`

*   **Document ID:** Auto-generated unique ID
*   **Description:** Stores customer order information.

| Field | Type | Description |
| :--- | :--- | :--- |
| `userId` | `string` | The ID of the user who placed the order (links to `users` collection). |
| `products` | `list` | A list of product objects that were ordered. |
| `shippingAddress`| `map` | The address where the order was shipped. |
| `totalAmount` | `number` | The total amount of the order. |
| `status` | `string` | The order status (`'pending'`, `'confirmed'`, `'shipped'`, `'delivered'`, `'cancelled'`). |
| `paymentMethod` | `string` | The payment method used. |
| `createdAt` | `timestamp` | Timestamp when the order was placed. |

---

### `carts`

*   **Document ID:** `userId` (same as the user's UID)
*   **Description:** Stores the contents of a user's shopping cart.

| Field | Type | Description |
| :--- | :--- | :--- |
| `...` | `...` | The structure can vary, but it contains cart items linked to a user. |

---

### `admin`

*   **Document ID:** Varies
*   **Description:** A collection for admin-only data and settings. Access is restricted to users with the `'admin'` role.

---

### `_test_`

*   **Document ID:** Varies
*   **Description:** A collection used for testing connectivity. It is publicly readable but not writable.
