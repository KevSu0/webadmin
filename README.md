# Camera World E-commerce Platform

A modern e-commerce platform for camera equipment built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

### Admin Panel
- **Dashboard**: Overview of products, orders, and sales statistics
- **Product Management**: Add, edit, and delete products with image uploads
- **Category Management**: Organize products into categories
- **Order Management**: Track and update order statuses
- **Firebase Authentication**: Secure admin access

### Customer Storefront
- **Product Catalog**: Browse cameras, lenses, and accessories
- **Search & Filters**: Find products by category, price, condition
- **Shopping Cart**: Add/remove items with persistent storage
- **User Authentication**: Customer registration and login
- **Checkout Process**: Secure order placement
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Build Tool**: Vite
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Forms**: React Hook Form + Yup validation

## Project Structure

```
src/
├── admin/                 # Admin panel components
│   ├── components/        # Admin-specific components
│   └── pages/            # Admin pages (Dashboard, Products, etc.)
├── customer/             # Customer storefront
│   ├── components/       # Customer-specific components
│   └── pages/           # Customer pages (Home, Products, etc.)
├── shared/              # Shared components
│   └── components/      # Reusable components (ProtectedRoute, etc.)
├── contexts/            # React Context providers
├── services/            # Firebase service functions
├── hooks/               # Custom React hooks
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── lib/                 # Library configurations
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Firebase project with Authentication, Firestore, and Storage enabled

### Installation

1. **Clone and install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Firebase**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore Database, and Storage
   - Copy your Firebase config and update `src/services/firebase.ts`

3. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**:
   ```bash
   pnpm dev
   ```

### Firebase Setup

**Important**: Follow the detailed setup guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for complete instructions.

#### Quick Setup Steps:

1. **Firebase Authentication**:
   ```bash
   # Login to Firebase CLI
   firebase login
   
   # Select your Firebase project
   firebase use <your-project-id>
   ```

2. **Deploy Security Rules**:
   ```bash
   # Using PowerShell (Windows)
   .\scripts\deploy-rules.ps1
   
   # Or using Node.js
   node scripts/deploy-rules.js
   
   # Or manually
   firebase deploy --only firestore:rules,storage
   ```

3. **Create Admin User**:
   ```bash
   # Using PowerShell (Windows)
   .\scripts\seed-admin.ps1
   
   # Or using Node.js
   node scripts/seed-admin.js
   ```

4. **Firebase Console Setup**:
   - Enable Authentication (Email/Password provider)
   - Enable Firestore Database
   - Enable Storage

5. **Firestore Collections**:
   - `users`: User profiles and roles
   - `products`: Product catalog
   - `categories`: Product categories
   - `orders`: Customer orders

6. **Storage Structure**:
   - `products/`: Product images
   - `categories/`: Category images
   - `users/`: User profile images

## Available Scripts

### Development Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm check` - Run type checking and linting

### Firebase Deployment Scripts
- `node scripts/deploy-rules.js` - Deploy Firestore and Storage rules
- `.\scripts\deploy-rules.ps1` - Deploy rules (PowerShell)
- `node scripts/seed-admin.js` - Create admin user
- `.\scripts\seed-admin.ps1` - Create admin user (PowerShell)

### Manual Firebase Commands
- `firebase login` - Authenticate with Firebase
- `firebase use <project-id>` - Select Firebase project
- `firebase deploy --only firestore:rules` - Deploy Firestore rules only
- `firebase deploy --only storage` - Deploy Storage rules only
- `firebase projects:list` - List available Firebase projects

## Key Features Implementation

### Authentication Flow
- Customer and admin authentication with Firebase Auth
- Role-based access control
- Protected routes for authenticated users
- Admin-only routes with role verification

### State Management
- **AuthContext**: User authentication state
- **CartContext**: Shopping cart management
- Custom hooks for loading states and pagination

### Firebase Integration
- **Authentication**: User registration, login, role management
- **Firestore**: Product catalog, orders, user data
- **Storage**: Image uploads for products and categories
- **Security Rules**: Proper access control (to be configured)

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Responsive navigation and layouts
- Touch-friendly interfaces

## Development Roadmap

### Phase 1: Foundation ✅
- [x] Project setup and structure
- [x] Firebase integration
- [x] Authentication system
- [x] Basic routing and layouts

### Phase 2: Core Features (Next)
- [ ] Product management (CRUD operations)
- [ ] Category management
- [ ] Shopping cart functionality
- [ ] Order processing

### Phase 3: Enhanced Features
- [ ] Search and filtering
- [ ] Image optimization
- [ ] Payment integration
- [ ] Email notifications

### Phase 4: Advanced Features
- [ ] Analytics dashboard
- [ ] Inventory management
- [ ] Customer reviews
- [ ] Wishlist functionality

## Contributing

1. Follow the established project structure
2. Use TypeScript for type safety
3. Follow React best practices
4. Write meaningful commit messages
5. Test thoroughly before submitting

## License

This project is licensed under the MIT License.