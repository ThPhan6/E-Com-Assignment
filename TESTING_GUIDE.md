# 🛒 Shopping Cart Feature — Prompt

## **Requirements**

Implement shopping cart functionality with the following features:

- Add products to cart
- View cart (for current logged-in user)
- Quantity adjustment
- Remove items
- Calculate total amount

## **File Setup**

The following files must be updated with **new code logic**:

- `CartPopup.tsx`
- `useCartStore.ts`
- `ProductCart.tsx`

### ⚠️ Context Rules

- `useProduct.ts` hook and `Product` component are **readonly** → ❌ Do NOT modify.
- All cart functionality logic should go inside `useCartStore.ts`.
- Create new hooks specifically for UI components:
  - `useCartPopup.ts` (for `CartPopup.tsx`)
  - `useProductCart.ts` (for `ProductCart.tsx`)

## **Expected Output**

The answer must always contain **separate files** with full code:

### 1. `useCartStore.ts`, `useCartPopup.ts`, `useProductCart.ts`

- Full TypeScript implementation of cart logic
- Correct usage of hooks and store pattern

### 2. `useProduct.test.ts`

- **BDD**: Gherkin scenarios (as comments or a separate `.feature`-style block at the top)
- **TDD**: Jest test cases for the logic inside `useCartStore.ts`, `useCartPopup.ts`, and `useProductCart.ts`

## **Final Step**

Mention running the tests explicitly:

```bash
npm run test useCartStore.test.ts useCartPopup.test.ts useProductCart.test.ts
```

======

# 📌 Requirement

Build an e-commerce application where users can log in, browse products, add items to cart, and complete orders.

## **Technical Requirements**

- React (Required)
- TypeScript (Required)
- State management: Zustand
- API: DummyJSON (https://dummyjson.com/)

## **Feature: Product List**

- Display product list
- Infinite scroll: load 20 items per request
- If first load does not fill viewport, keep fetching until viewport filled
- Search functionality by product name
- "Add to Cart" button (leave logic stub for now)

---

# 📌 Task

### **Step 1 – Function Logic**

Implement the **function logic inside `useProduct.ts`** using TypeScript.

Context:

- `src/product/index.tsx` → UI (already implemented, do NOT touch)
- `useProductStore.ts` → Zustand store (already exists, do NOT touch)
- `types/product.ts` → types already defined, do NOT redefine
- `product.api.ts` → API already implemented, do NOT modify
- `useProduct.ts` → ⬅️ **only the function logic is written here**

---

### **Step 2 – BDD + TDD**

After implementing the logic:

- Write **BDD feature scenarios** (in Gherkin syntax) for product listing, infinite scroll, search, and add-to-cart.
- Write **TDD test cases** (Jest test outlines + matchers) in the same file: `useProduct.test.ts`.

⚠️ Rule: BDD and TDD should **not** go inside `useProduct.ts`. They should be placed in `useProduct.test.ts`.

---

### **Step 3 – Run Tests**

- After writing `useProduct.test.ts`, run the tests to verify the function logic in `useProduct.ts`.
- If tests fail, update logic until all pass.

---

# 📌 Implementation Details

- Handle **first load** (auto fetch products on init).
- Handle **infinite scroll**:
  - Fetch next 20 items when user scrolls
  - If viewport not filled after fetch, continue loading until filled or no more data
- Handle **search**:
  - Reset products + pagination
  - Fetch new products for given term
- Handle **add to cart**:
  - Only stub out the logic (call `addToCart(product)`), don’t implement internals
- Show **loading state** for:
  - Fetching more products
  - Searching
- Keep **imports clean and minimal**
- Add **inline comments** explaining logic

---

# 📌 Output

The answer should always contain **two separate files**:

### 1. `useProduct.ts`

- Full TypeScript implementation of the logic

### 2. `useProduct.test.ts`

- BDD (Gherkin scenarios as comments or separate `.feature` content)
- TDD (Jest test cases for the logic in `useProduct.ts`)

Finally, mention running the tests:

```bash
npm run test useProduct.test.ts
```
