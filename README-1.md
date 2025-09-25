# 🛒 E-Commerce Application — Phase 1: Authentication System

A modern e-commerce application built with **React, TypeScript, and Tailwind CSS**.  
This document focuses on **Phase 1: Authentication System**.

---

## 🚀 Tech Stack

- **Frontend:** React 19.1.1 + TypeScript 5.8.3
- **Styling:** Tailwind CSS 4.1.13
- **State Management:** Zustand 5.0.8
- **Routing:** React Router DOM 7.9.1
- **Forms:** React Hook Form 7.63.0 + Zod 4.1.9
- **HTTP Client:** Axios 1.12.2
- **Authentication:** JWT with jwt-decode 4.0.0
- **UI Components:** Radix UI (Dropdown, Popover)
- **Notifications:** React Hot Toast 2.6.0
- **Build Tool:** Vite 7.1.6

---

## 🎯 Phase 1 Goal — Authentication System

Implement a **secure authentication flow** with:

- **JWT Token Management**

  - Login & Register using DummyJSON API
  - Handle token refresh & expiration
  - Automatic logout on token expiration

- **Protected Routes**

  - Route-level auth guard with redirects
  - Unauthorized access → `/403` page

- **Persistent Sessions**

  - Store token securely in `localStorage`
  - Auto-rehydrate Zustand store on refresh

- **API Integration**

  - DummyJSON Authentication Endpoints:
    - `POST /auth/login` — User login
    - `GET /auth/me` — Get current user
    - `POST /auth/refresh` — Refresh tokens

- **UX Considerations**
  - Error messages for invalid credentials
  - Loading states on login/register
  - Auto-redirect after successful login

---

## ⚙️ Implementation Requirements

- **Zustand Auth Store**

  - `isAuthenticated`
  - `user`
  - `accessToken`
  - `refreshToken`

- **Axios Client**

  - Interceptors for JWT
  - Automatic refresh on expiration

- **Error Handling**

  - Missing/invalid tokens
  - Expired tokens
  - API failures

- **Security**
  - Secure token decode using `jwt-decode`
  - Proper redirect flow on invalid sessions

---

## 🧪 Edge Cases (Must Handle)

- Invalid login → show error message
- Expired token → auto-logout + redirect to `/login`
- Deleted token in localStorage → redirect `/403`
- Persist session after browser refresh

---

## ✅ Deliverables

1. **Code Implementation**

   - React components: `Login`, `Register`, `ProtectedRoute`
   - Zustand store: `useAuthStore`
   - Axios client with interceptors
   - Token persistence logic

2. **Inline Comments & Explanations**

   - Why certain design decisions were made
   - Flow of authentication

3. **Unit Tests**
   - Login success/failure
   - Token refresh
   - Protected route guard

---

## 🔄 AI Double-Check (Self Review)

After finishing the implementation, **review the code again** with this checklist:

> **Please review the following code. Consider:**
>
> 1. Code quality / best practices
> 2. Potential bugs or edge cases
> 3. Performance optimizations
> 4. Readability / maintainability
> 5. Any security concerns
>
> **Suggest improvements and explain your reasoning for each suggestion.**

---

## 📌 Notes

This phase ensures a **secure and reliable authentication foundation** for the application.  
Later phases (Products, Cart, Checkout) will build on top of this base.
