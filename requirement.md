# Implement React + TypeScript E-commerce App (DummyJSON) — Single Prompt

You are a **senior full-stack developer** AI. You will implement a complete **React + TypeScript e-commerce** application (using https://dummyjson.com/) into an existing repository where I have already created the empty files. Follow these rules _exactly_.

---

## Tech Stack

- React (Vite) + TypeScript
- React Router v6+
- TailwindCSS
- react-hook-form
- react-hot-toast
- react-infinite-scroll-component
- react-lazy-load-image-component
- zustand
- jest

---

## Absolute, Non-Negotiable Rules (READ CAREFULLY)

1. **Phase-by-phase only**

   - For each phase you must do TWO steps:
     - **Step A: Phase File Plan (no code).** Output **only** an ordered list of files you will modify/fill in this phase. For each file: filename + 1–2 bullet points describing purpose. Do **not** output code yet. End Step A with exactly:  
       `Type CONFIRM PHASE X to proceed.`  
       (Replace X with phase number.)
     - **Step B: After I type `CONFIRM PHASE X`**, implement the code for only the files listed in Step A, **in the same order**. For each file, write code into each file corresponding(dont write any code on chat area):  
       `### File: src/path/to/file`  
       and the file content.
       After delivering all files, stop and print:  
       `Phase X complete. Review and then type CONFIRM PHASE Y to continue.`

2. **FILL EXISTING EMPTY FILES**

   - You must prefer to implement logic into files that are **empty** (zero bytes) and exist in the repository (I created them).
   - **Do NOT create new files.** If you need a file that does not exist, STOP and print:  
     `MISSING FILE: path/to/file`  
     — then wait for instruction.
   - If a file exists but is **not empty**, DO NOT overwrite it. Instead, STOP and print:  
     `FILE NOT EMPTY: path/to/file`  
     — then wait for instruction.

3. **No repository analysis / no external tools**

   - Under no circumstances execute file system scans, git commands, `ls`, or call analysis tools. Do **not** use `web.run` or any external tool to inspect the repo. Assume I already created the empty files and your job is to fill them per phase. If you need to know a file exists/empty, ask only when you receive `FILE NOT EMPTY` or `MISSING FILE` output as above.

4. **Do not modify any `*.api.*` or `*.type.*` files.**

   - If you believe a change to an `*.api.*` or `*.type.*` file is required, STOP and print:  
     `REQUEST PERMISSION TO MODIFY: path/to/file`  
     Do not modify until explicitly allowed.

5. **Do not put logic inside `*.tsx` files.**

   - `*.tsx` files must remain presentational only. All business/interaction logic must go into hooks (`src/hooks/...`) or zustand stores (`src/store/...`). If a `.tsx` component currently contains logic, STOP and print:  
     `REFUSE_OVERWRITE_TSX_WITH_LOGIC: path/to/file`  
     — do not change the `.tsx` until you are permitted.

6. **Zustand mandatory**

   - Use zustand for global application state (auth, cart, products). Local hook state allowed where appropriate.

7. **LocalStorage rules**

   - `userCarts` must persist and **must NOT** be deleted on logout. On logout clear **all other** store state and localStorage keys except `userCarts`.

8. **Authentication & Routing rules**

   - Implement login using `/auth/login` (DummyJSON). Persist JWT in localStorage.
   - Always validate token presence before any protected action. If token missing/invalid → redirect to `/403`.
   - If user logs in then manually navigates to `/products` (without allowed flow) the app must redirect to `/404` (business rule).
   - Handle manual deletion of token from localStorage: protected routes must detect this and redirect to `/403`.

9. **Testing constraints**

   - Write jest tests **only** for hook/store function logic (no tests for `*.tsx` components).
   - For each `it()` add BDD comments inside the test:  
     `// Given ...`  
     `// When ...`  
     `// Then ...`

10. **Presentation & code format**

    - Each delivered file must begin with `// Purpose: ...`.
    - Use strict TypeScript types. Annotate function params & return types. Add `TRICKY:` comments where logic is subtle.
    - Reuse code, follow SOLID & DRY.

11. **If anything is unclear or violates the above rules, STOP and print one of these exact tokens (no other text):**
    - `MISSING FILE: path/to/file`
    - `FILE NOT EMPTY: path/to/file`
    - `REQUEST PERMISSION TO MODIFY: path/to/file`
    - `REFUSE_OVERWRITE_TSX_WITH_LOGIC: path/to/file`

---

## Phase List (STRICT)

- **Phase 1 — Authentication**  
  (Login page, zustand auth store, hooks, NavBar, protected route guard, 403/404 pages, tests for hooks/store)
- **Phase 2 — Product List**  
  (Fetch `/products` 20 per load, infinite scroll, search, product card, add-to-cart logic into `userCarts`, lazy images, tests)
- **Phase 3 — Shopping Cart**  
  (View/edit cart, update stock, remove items, total selector, persist userCart, tests)
- **Phase 4 — Checkout**  
  (Checkout form, validation, PUT user, DELETE cart, order confirmation, tests)

---

## Phase 1 Specific Requirements (copy of your original rules)

- Implement login with DummyJSON `/auth/login`.
- Manage JWT token securely (localStorage).
- Redirect to product list after login.
- Protect the cart page (only accessible if authenticated).
- Beware user can manually delete the token in local storage.
- Before doing any action, check if the user is authenticated, redirect to the 403 page.
- After login, if user enters manually the url to the product list page, redirect to the 404 page.
- After logout, remove all store, EXCEPT `userCart` in storage.
- Input validation: if `!username || !password` show toast require.
- NavBar: left logo; right cart button (popup), profile dropdown (Profile = "coming soon"), logout.
- Do not update `*.api.*` or `*.type.*`.
- Do not put logic in `*.tsx`.

---

## Output Rules — EXACT FORMAT

1. **Phase file list** (STEP A — no code). Example:

   - `src/hooks/useAuth.ts` — manage login/logout, token check, redirect logic.
   - `src/store/auth.store.ts` — zustand store for token + user.
   - `src/pages/Login.tsx` — presentational login form (calls `useAuth`).
   - `src/components/layout/NavBar.tsx` — presentational only; shows login state, cart button, logout.
   - `src/pages/Forbidden.tsx` — 403 page.
   - `src/pages/NotFound.tsx` — 404 page.
   - `src/tests/useAuth.test.ts` — jest tests for `useAuth` & auth store (BDD comments).  
     Type CONFIRM PHASE 1 to proceed.

2. **After I confirm** (`CONFIRM PHASE 1`) produce the code blocks for each file listed, **in the same order**. For each file:
   - Append code into file `### File: src/path/to/file`
   - The file content should be a valid file with `// Purpose: ...` first line.
   - Use only code; no extra commentary outside the code blocks.
   - After finishing the last file, print:  
     `Phase 1 complete. Review and then type CONFIRM PHASE 2 to continue.`

---

## IMPORTANT: Behavior to avoid (do not do any of these)

- Do not analyze the repository or call external tools.
- Do not print any file contents other than the files requested after confirmation.
- Do not create new files.
- Do not update `*.api.*` or `*.type.*` files.
- Do not write tests for `.tsx` components.

---

## Begin NOW (First Output)

- List Phase 1 files only (filenames + 1–2 bullet purpose each) — **no code**.
- End with exactly: `Type CONFIRM PHASE 1 to proceed.`

You will wait for my `CONFIRM PHASE 1` before writing any code.
