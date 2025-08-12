# Firestore Security Rules: Refinement Plan

This document outlines the proposed refinements to the existing Firestore security rules. The goal is to enhance data integrity, tighten access controls, and align the rules more closely with the business logic defined in the system architecture.

## 1. Proposed Changes

### 1.1. `users` Collection

*   **Create Operation**:
    *   **Problem**: The current rule allows any authenticated user to create their own user document, but it doesn't validate the initial data. A user could potentially assign themselves a `Super Admin` role upon signup.
    *   **Refinement**: The `create` rule will be updated to enforce that a new user's `role` can only be set to `'Client'` or `'Provider'`. The `Super Admin` role must be granted by an existing Super Admin via an `update` operation.

*   **Update Operation**:
    *   **Problem**: A user can currently change any field in their own profile, including their `role`.
    *   **Refinement**: The `update` rule will be modified to prevent users from changing their own `role`. Only a `Super Admin` will be permitted to modify the `role` field for any user.

### 1.2. `expera_providers` Collection

*   **Data Model Enhancement**:
    *   **Proposal**: Add a `status` field to the `expera_providers` data model (e.g., `status: 'active' | 'pending' | 'suspended'`). This will allow for administrative control over a provider's visibility and operations.

*   **Create Operation**:
    *   **Problem**: A user with the `'Provider'` role can create an `expera_provider` entity but is not required to add themselves as a manager (`providerUids`), potentially orphaning the entity.
    *   **Refinement**: The `create` rule will be updated to ensure that the `providerUids` array of the new document contains the `userId` of the user creating it.

*   **Read Operation**:
    *   **Problem**: Currently, any signed-in user can read all `expera_provider` documents, regardless of their status.
    *   **Refinement**: The `read` rule will be updated to only allow public access if the provider's `status` is `'active'`. Managers and Super Admins will still be able to access providers regardless of their status.

### 1.3. `experiences` Collection

*   **Read Operation**:
    *   **Problem**: Similar to providers, any signed-in user can read all `experience` documents.
    *   **Refinement**: The `read` rule will be updated to only allow public access if the experience's `publishStatus` is `'published'`. The associated `expera_provider` must also have an `'active'` status. Managers and Super Admins will retain full read access.

## 2. Implementation Steps

1.  **Update Data Model**: Add the `status` field to the `ExperaProvider` type definition in `src/types/index.ts`.
2.  **Update Security Rules**: Apply the refined logic to the `firestore.rules` file.
3.  **Update Architecture Document**: Reflect the data model and security rule changes in `docs/user-business-entity-architecture.md` to ensure documentation remains current.

Please review this plan. Once you approve, I will proceed with the implementation.