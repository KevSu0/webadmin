# Application Architecture

This document provides an overview of the technical architecture of the Camera World web application.

## Core Technologies

- **Framework**: [React](https://reactjs.org/) (version 18) using [Vite](https://vitejs.dev/) for a fast development experience and optimized builds.
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety and improved developer experience.
- **Backend & Database**: [Firebase](https://firebase.google.com/) for a comprehensive backend-as-a-service (BaaS).
    - **Authentication**: Manages user sign-up, sign-in, and session persistence.
    - **Firestore**: A NoSQL document database for storing application data like users, products, categories, and orders.
    - **Storage**: Used for hosting user-uploaded content, such as product and category images.
- **Routing**: [React Router](https://reactrouter.com/) (version 7) for declarative, client-side routing.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS workflow, enabling rapid and consistent UI development.
- **State Management**: Primarily uses React Context (`AuthContext`, `CartContext`) for managing global state.
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) for efficient and performant form validation and management.

## Project Structure

The project follows a standard feature-based directory structure within the `src` directory. The goal is to separate concerns and group related files by their function.

-   `/src`: Root directory for all application source code.
    -   `/api`: Contains a basic Express-based backend API, primarily for server-side tasks or future expansion.
    -   `/admin`: Contains components and pages specific to the Admin section of the application.
    -   `/customer`: Contains components and pages specific to the customer-facing storefront.
    -   `/components`: Houses global, shared UI components that are used across multiple sections of the application (e.g., `NetworkStatusMonitor`).
    -   `/contexts`: Provides global state management via React Context. Key contexts include `AuthContext` for user session management and `CartContext` for the shopping cart.
    -   `/hooks`: Contains reusable custom React hooks (e.g., `useLocalStorage`, `useMediaQuery`).
    -   `/lib`: General, framework-agnostic utility functions.
    -   `/pages`: Contains page-level components. **Note:** There is some organizational overlap with `/admin/pages` and `/customer/pages`. A future refactor could consolidate all pages under this directory, organized by feature.
    -   `/services`: The data layer of the application. This directory is responsible for all communication with Firebase. Each file corresponds to a specific data entity (e.g., `auth.ts`, `products.ts`).
    -   `/shared`: Contains components and logic shared between different parts of the app, such as route guards (`ProtectedRoute`, `AdminRoute`).
    -   `/types`: Centralized location for all TypeScript type and interface definitions.
    -   `/utils`: Application-specific utility functions that may have dependencies on other parts of the app.

## Data Flow

The application follows a standard unidirectional data flow, which is typical for React applications:

1.  **UI Components** (from `/pages`, `/admin`, `/customer`) render the user interface and capture user input.
2.  **Event Handlers** within these components are triggered by user actions (e.g., clicking a button, filling a form).
3.  These handlers call functions from the **Services Layer** (`/services`) to interact with the backend.
4.  The **Services Layer** contains all the logic for communicating with the **Firebase Backend** (Authentication, Firestore, Storage) to perform CRUD (Create, Read, Update, Delete) operations.
5.  Global state, such as the current user's authentication status or the contents of the shopping cart, is managed by **React Contexts** in the `/contexts` directory. The `onAuthStateChanged` listener from Firebase updates the `AuthContext` in real-time.
6.  When data changes (either from a Firebase response or a context update), React's reconciliation process efficiently re-renders only the necessary components in the UI.

## Styling Approach

-   **Framework**: The application uses **Tailwind CSS** for all styling. This is a utility-first CSS framework that allows for rapid development of custom designs without writing custom CSS.
-   **Configuration**: The main configuration is located in `tailwind.config.js`. It is set up to purge unused styles in production builds for a smaller CSS footprint.
-   **Best Practices**: Components are styled directly in their JSX files using Tailwind's utility classes. This approach promotes co-location of styles and component logic, making components more self-contained and easier to maintain. Custom CSS is used sparingly and is located in `src/index.css`.
