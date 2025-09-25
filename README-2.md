# 🚀 Phase 2 Prompt: Products List (Frontend + Backend)

You are an AI developer. Implement **Phase 2: Products List** of the project.  
Follow all requirements carefully and avoid common mistakes mentioned.

---

## 📑 Requirements

1. **Fetch Products**

   - Use endpoint: `/products`
   - Return **20 items per load**.
   - API supports pagination & search.
   - Example:
     ```ts
     export const productApi = {
       // Get all products with pagination and search
       getProducts: (
         params: { page: number; limit: number; search?: string }
       ) => ...
     }
     ```

2. **Infinite Scroll**

   - Continuously load more products when reaching the bottom.
   - ⚠️ Important: if the **viewport is not yet filled**, trigger additional loads until it is.
   - Each "load more" fetches the **next page**.
   - Must not duplicate products.

3. **Search**

   - Add search input to filter products by name/keyword.
   - Reset pagination when search changes.
   - Show loading state when fetching.

4. **Error Handling**
   - Show retry option if API fails.
   - Empty state if no results.

---

## 🛠️ Implementation Guide

- **Frontend**

  - React + Zustand/Redux for state management.
  - Tailwind or Material UI for UI.
  - Maintain `products`, `page`, `hasMore`, `loading`, `search` states.
  - Trigger `fetchNextPage()` when:
    - User scrolls near bottom, OR
    - Viewport still not filled after load.
  - Reset state when `search` changes.

- **Backend (dummy API already provided)**
  - `/products?page=1&limit=20&search=abc`
  - Response:
    ```json
    {
      "items": [ ...products ],
      "total": 120,
      "page": 1,
      "limit": 20
    }
    ```

---

## ✅ BDD Tests

Write BDD with `describe` + `it` for each case.

## 🔄 AI Double-Check (Self Review)

Before finishing, review the implementation:

1. Code Quality – Is state management clean & modular?
2. Edge Cases – Empty results, API failure, fast typing in search, repeated scroll events.
3. Performance – Avoid duplicate requests, debounce search, minimal re-renders.
4. Correct Load More – Does it fill viewport correctly without breaking infinite scroll?
5. Readability – Is the code understandable for future devs?
