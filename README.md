# E-Commerce Application

A modern e-commerce application built with React, TypeScript, and Tailwind CSS. Users can browse products, manage their cart, and complete orders with a comprehensive checkout process.

## 🚀 Live Demo

**Deployment URL:** https://e-com-assignment.vercel.app/login

## 🛠️ Tech Stack

- **Frontend:** React 19.1.1, TypeScript 5.8.3
- **Styling:** Tailwind CSS 4.1.13
- **State Management:** Zustand 5.0.8
- **Routing:** React Router DOM 7.9.1
- **Forms:** React Hook Form 7.63.0 + Zod 4.1.9
- **HTTP Client:** Axios 1.12.2
- **Authentication:** JWT with jwt-decode 4.0.0
- **UI Components:** Radix UI (Dropdown, Popover)
- **Notifications:** React Hot Toast 2.6.0
- **Infinite Scroll:** React Infinite Scroll Component 6.1.0
- **Lazy Loading:** React Lazy Load Image Component 1.6.3
- **Build Tool:** Vite 7.1.6

## 📁 Project Structure

```
src/
├── api/                    # API configuration
│   └── axiosClient.ts      # Axios instance with interceptors
├── components/             # Reusable components
│   ├── CountryStateSelector.tsx
│   └── Image.tsx          # Lazy loading image component
├── features/              # Feature-specific components
│   ├── CartPopup.tsx      # Shopping cart popup
│   ├── Layout.tsx         # Main layout wrapper
│   ├── Loading.tsx       # Loading spinner
│   ├── NavBar.tsx        # Navigation bar
│   ├── ProductCard.tsx   # Product display card
│   └── ProtectedRoute.tsx # Route protection
├── hooks/                 # Custom React hooks
│   ├── useCheckout.ts    # Checkout logic
│   ├── useLogin.ts       # Authentication logic
│   └── useProduct.ts     # Product management
├── lib/                   # Utility libraries
│   ├── constant.ts       # App constants
│   ├── helper.ts         # Helper functions
│   └── route.ts          # Route definitions
├── components/            # Reusable components
│   ├── AppRouter.tsx     # Main application router
│   ├── PublicRoutes.tsx  # Public route definitions
│   └── PrivateRoutes.tsx # Private route definitions
├── pages/                 # Page components
│   ├── 404/              # 404 Not Found page
│   │   └── index.tsx
│   ├── 403/              # 403 Forbidden page
│   │   └── index.tsx
│   ├── checkout/         # Checkout flow
│   │   ├── components/
│   │   │   ├── CheckoutFormStep.tsx
│   │   │   └── schema.ts
│   │   └── index.tsx
│   ├── design-presentation/ # Design presentation page
│   │   └── index.tsx
│   ├── login/            # Login page
│   ├── order-confirmation/ # Order success page (protected)
│   └── product/          # Product listing
├── service/              # API services
│   ├── auth.api.ts       # Authentication APIs
│   ├── cart.api.ts       # Cart management APIs
│   ├── product.api.ts    # Product APIs
│   └── user.api.ts       # User management APIs
├── store/                # Zustand stores
│   ├── useAuthStore.ts   # Authentication state
│   ├── useCartStore.ts   # Shopping cart state
│   ├── useLoadingStore.ts # Loading states
│   ├── useOrderStore.ts  # Order management
│   ├── useProductStore.ts # Product state
│   └── util.ts           # Store utilities
├── types/                 # TypeScript definitions
│   ├── cart.ts           # Cart types
│   ├── checkout.ts       # Checkout types
│   ├── product.ts        # Product types
│   └── user.ts           # User types
└── utils/                # Utility functions
    └── (error handling moved to api/axiosClient.ts)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd E-Com-Assignment
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔧 Implementation Details

### 1. Authentication System

- **JWT Token Management:** Automatic token refresh and expiration handling
- **Protected Routes:** Route-level authentication with redirects
- **Persistent Sessions:** LocalStorage-based token persistence
- **API Integration:** DummyJSON authentication endpoints

**Key Features:**

- Automatic token refresh before expiration
- Secure token storage and validation
- Session persistence across browser refreshes
- Protected route access control

### 2. Product Management

- **Infinite Scroll:** Load 20 products per page with automatic pagination
- **Search Functionality:** Real-time product search with debouncing
- **Performance Optimization:** Lazy loading images and virtual scrolling
- **Stock Management:** Real-time stock tracking and cart synchronization

**Key Features:**

- Debounced search (500ms delay)
- Auto-fill content when viewport is not full
- Stock availability tracking
- Optimized image loading

### 3. Shopping Cart

- **User-Specific Carts:** Separate cart storage per authenticated user
- **Real-Time Updates:** Instant cart updates with optimistic UI
- **Quantity Management:** Add, remove, and update item quantities
- **Stock Synchronization:** Prevent overselling with stock validation

**Key Features:**

- Persistent cart storage with Zustand
- User-specific cart isolation
- Real-time stock calculations
- Toast notifications for user feedback

### 4. Checkout Process

- **Multi-Step Form:** Comprehensive shipping and payment information
- **Form Validation:** Real-time validation with Zod schema
- **Address Management:** Country/state/city selection with auto-completion
- **Payment Simulation:** Credit card formatting and validation
- **Order Simulation:** Complete order flow with API integration

**Key Features:**

- Real-time form validation
- Auto-formatting for card numbers
- Address auto-completion
- Order confirmation with summary

### 5. State Management

- **Zustand Stores:** Lightweight state management
- **Persistent Storage:** Cart and authentication persistence
- **Optimistic Updates:** Immediate UI updates with error handling
- **Type Safety:** Full TypeScript integration

## 🔍 API Integration

### DummyJSON Endpoints Used

- **Authentication:**

  - `POST /auth/login` - User login
  - `GET /auth/me` - Get current user
  - `POST /auth/refresh` - Refresh tokens

- **Products:**

  - `GET /products` - Get products with pagination
  - `GET /products/search` - Search products

- **User Management:**

  - `PUT /users/{id}` - Update user information

- **Cart Management:**
  - `DELETE /carts/{id}` - Clear user cart

## 🚧 Challenges & Considerations

### 1. **API Limitations**

- **Challenge:** DummyJSON doesn't persist data changes
- **Solution:** Implemented local state management with Zustand
- **Consideration:** Simulated order process with local state updates

### 2. **Authentication Flow**

- **Challenge:** Token expiration and refresh handling
- **Solution:** Automatic token refresh with expiration detection
- **Consideration:** Secure token storage and session management

### 3. **Performance Optimization**

- **Challenge:** Large product lists and image loading
- **Solution:** Infinite scroll with lazy loading
- **Consideration:** Debounced search and optimized rendering

### 4. **State Synchronization**

- **Challenge:** Cart state across multiple components
- **Solution:** Centralized Zustand store with persistence
- **Consideration:** Real-time updates and error handling

### 5. **Form Validation**

- **Challenge:** Complex checkout form with multiple validation rules
- **Solution:** Zod schema with React Hook Form integration
- **Consideration:** Real-time validation and user feedback

### 6. **Error Handling**

- **Challenge:** API failures and network issues
- **Solution:** Comprehensive error handling with retry logic
- **Consideration:** User-friendly error messages and recovery
