# Firestore Schema Design

This document outlines the Firestore database schema for the application, designed for scalability, security, and efficient querying.

## Schema Diagram

```mermaid
graph TD
    subgraph "Firestore Collections"
        Users("users/{userId}")
        Providers("expera_providers/{providerId}")
        Experiences("experiences/{experienceId}")
    end

    subgraph "Relationships"
        Users -- "Manages (Many-to-Many)" --> Providers
        Providers -- "Offers (1-to-Many)" --> Experiences
    end

    subgraph "Data Structures"
        Users_Data["
            <strong>User Document</strong><br/>
            - email: string<br/>
            - name: string<br/>
            - role: 'Client' | 'Provider'<br/>
            - createdAt: timestamp
        "]

        Providers_Data["
            <strong>Expera Provider Document</strong><br/>
            - providerUids: array[string] (FK to users.userId)<br/>
            - publicName: string<br/>
            - avatarUrl: string (optional)<br/>
            - bio: string (optional)
        "]

        Experiences_Data["
            <strong>Experience Document</strong><br/>
            - providerId: string (FK to expera_providers.providerId)<br/>
            - title: string<br/>
            - category: 'Culinary' | 'Adventure' | 'Wellness' | 'Arts'<br/>
            - price: number<br/>
            - photos: array[string]<br/>
            - description: string<br/>
            - publishStatus: 'draft' | 'published'<br/>
            - createdAt: timestamp<br/>
            - updatedAt: timestamp
        "]
    end

    Users --> Users_Data
    Providers --> Providers_Data
    Experiences --> Experiences_Data
```

## Collections

### `users`

*   **Document ID:** `userId` (Firebase Auth UID)
*   **Description:** Stores essential user information linked to their authentication account.

| Field | Type | Description |
| :--- | :--- | :--- |
| `email` | `string` | User's email address. |
| `name` | `string` | User's display name. |
| `role` | `string` | User's role (`Client` or `Provider`). |
| `createdAt` | `timestamp` | Server-generated timestamp of account creation. |

### `expera_providers`

*   **Document ID:** Auto-generated unique ID
*   **Description:** Stores public-facing information for experience providers (business entities).

| Field | Type | Description |
| :--- | :--- | :--- |
| `providerUids` | `array` | An array of `userId`s for users who can manage this entity. |
| `publicName` | `string` | The public name of the provider (e.g., "Mountain Ascent Guides"). |
| `avatarUrl` | `string` | (Optional) URL for the provider's avatar. |
| `bio` | `string` | (Optional) A short biography for the provider. |

### `experiences`

*   **Document ID:** Auto-generated unique ID
*   **Description:** Stores details for each experience offered by a provider.

| Field | Type | Description |
| :--- | :--- | :--- |
| `providerId` | `string` | The ID of the `expera_providers` document this experience belongs to. |
| `title` | `string` | The title of the experience. |
| `category` | `string` | The category of the experience (`Culinary`, `Adventure`, etc.). |
| `price` | `number` | The price per person for the experience. |
| `photos` | `array` | An array of URLs for the experience's photos. |
| `description` | `string` | A detailed description of the experience. |
| `publishStatus` | `string` | The status of the experience (`draft` or `published`). |
| `createdAt` | `timestamp` | Server-generated timestamp of creation. |
| `updatedAt` | `timestamp` | Server-generated timestamp of the last update. |
