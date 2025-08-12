# Application Architecture

This document provides an overview of the technical architecture of the Camera World web application.

## Core Technologies

- **Framework**: [React](https://reactjs.org/) (using Vite)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Storage)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router](https://reactrouter.com/)
- **State Management**: React Context (`AuthContext`, `CartContext`)

## Project Structure

The project follows a standard feature-based directory structure within the `src` directory. The goal is to separate concerns and group related files by their function.

-   `/src`: Root directory for all application source code.
    -   `/api`: Contains the Express-based backend API. This runs as a separate server process.
    -   `/admin`: Contains components and pages specific to the Admin section of the application.
    -   `/customer`: Contains components and pages specific to the customer-facing storefront.
    -   `/components`: Houses global, shared UI components that are used across multiple sections of the application (e.g., `NetworkStatusMonitor`).
    -   `/contexts`: Provides global state management via React Context. Key contexts include `AuthContext` for user session management and `CartContext` for the shopping cart.
    -   `/hooks`: Contains reusable custom React hooks (e.g., `useLocalStorage`).
    -   `/lib`: General, framework-agnostic utility functions.
    -   `/pages`: Contains page-level components. **Note:** There is some organizational overlap with `/admin/pages` and `/customer/pages`. A future refactor could consolidate all pages under this directory, organized by feature.
    -   `/services`: The data layer of the application. This directory is responsible for all communication with external services, primarily Firebase. Each file corresponds to a specific data entity (e.g., `auth.ts`, `products.ts`).
    -   `/shared`: Contains components and logic shared between different parts of the app, such as route guards (`ProtectedRoute`, `AdminRoute`).
    -   `/types`: Centralized location for all TypeScript type and interface definitions.
    -   `/utils`: Application-specific utility functions that may have dependencies on other parts of the app.

## Data Flow

The application follows a unidirectional data flow:

1.  **UI Components** (from `/pages`, `/admin`, `/customer`) trigger actions (e.g., a button click).
2.  **Event Handlers** in the components call functions from the **Services Layer** (`/services`).
3.  The **Services Layer** communicates with the **Firebase Backend** (or the emulators) to perform CRUD (Create, Read, Update, Delete) operations.
4.  For global state (like user authentication or the shopping cart), the **Contexts** (`/contexts`) hold the state and provide it to the component tree.
5.  When the data changes (either in Firebase or in a context), the React component tree re-renders to reflect the new state.

## Styling Approach

-   **Framework**: The application uses **Tailwind CSS** for all styling. This is a utility-first CSS framework that allows for rapid development of custom designs without writing custom CSS.
-   **Configuration**: The Tailwind configuration is in `tailwind.config.js`.
-   **Best Practices**: Components should be styled directly in the JSX using Tailwind's utility classes. Custom CSS should be avoided wherever possible to maintain consistency and leverage the power of the framework.
