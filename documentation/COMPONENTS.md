# Component Library

This document provides an overview of the key UI components used in the Camera World application.

## Layout Components

### `CustomerLayout.tsx`
- **Purpose**: Provides the main layout for the customer-facing part of the application. It includes the main header with navigation and search, the footer, and a content area for the current page. It also handles the display of the user's authentication state (showing "Sign in"/"Sign up" buttons or a user dropdown menu).
- **Props**:
  - `children: React.ReactNode`: The page component to be rendered within the layout.
- **Usage**: Wraps all customer-facing routes in `App.tsx`.

### `AdminLayout.tsx`
- **Purpose**: Provides the main layout for the admin dashboard section. It includes a persistent sidebar for navigation between different admin pages (Dashboard, Products, Categories, etc.) and a main content area to render the selected admin page.
- **Props**:
  - `children: React.ReactNode`: The admin page component to be rendered within the layout.
- **Usage**: Wraps all protected admin routes in `App.tsx`.

## Shared Components

### `NetworkStatusMonitor.tsx`
- **Purpose**: A highly configurable, floating component that provides real-time feedback on the user's network status (online/offline). It is intended to be used as a global component in `App.tsx`.
- **Features**:
    - Displays "Online" or "Offline" status.
    - Draggable and remembers its position in `localStorage`.
    - Can be minimized and closed.
    - Includes a manual "Retry" button.
    - Provides a `useNetworkStatus` hook for other components to access the network state.
- **Props**:
  - `showDetails?: boolean`: If true, shows detailed stats like last update time.
  - `position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | ...`: Sets the initial position of the component.
  - `compact?: boolean`: Renders a smaller, more minimal version of the component.
  - `onRetry?: () => void`: A callback function to be executed when the user clicks the "Retry" button.
  - `draggable?: boolean`: Determines if the component can be dragged around the screen.
  - `closable?: boolean`: Determines if the component can be closed.
  - `minimizable?: boolean`: Determines if the component can be minimized.
- **Usage**: Instantiated once in `App.tsx` to provide a global network status indicator.

---

*This document will be expanded to include other key components as the project evolves.*
