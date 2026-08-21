# AGENTS.md

## Repository structure

Two independent packages (no root `package.json`, no workspace tooling).

```
tickethub-platform-frontend/   React 19 + Vite 8 + TypeScript 6 SPA
tickethub-backend/             Express 5 + Drizzle ORM (RC) + MySQL + TypeScript 7 API
```

Each has its own `node_modules/`, `package.json`, `package-lock.json`, and `.gitignore`.

No tests, no CI/CD, no Docker, no `.github/`.

---

## Frontend (`tickethub-platform-frontend/`)

| Command | Action |
|---|---|
| `npm run dev` | Dev server on `0.0.0.0` (`vite --host`) |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | `eslint .` |
| `npm run preview` | `vite preview` |

### Key details

- **Entrypoint**: `src/main.tsx` → `src/App.tsx` (React Query provider + `<BrowserRouter>`)
- **Router**: `react-router` v8 (not `react-router-dom`). Routes defined in `src/routes/index.tsx`. Dashboard routes require auth with role guards.
- **Path alias**: `@/` → `./src/` (in both `tsconfig.json` and `vite.config.ts`)
- **`verbatimModuleSyntax: true`** → always use `import type` for type-only imports.
- **React Compiler**: enabled via `@rolldown/plugin-babel` + `babel-plugin-react-compiler` in `vite.config.ts`.
- **Tailwind v4**: no config file; uses `@tailwindcss/vite` plugin; imports via `@import "tailwindcss"` in `src/index.css`.
- **`erasableSyntaxOnly: true`** in `tsconfig.app.json` (TS 6+ feature).
- **Required env vars** (all throw if missing):
  - `VITE_DEV_API_BASE_URL`, `VITE_PROD_API_BASE_URL`
  - `VITE_DEV_CLIENT_SELF_URL`, `VITE_PROD_CLIENT_SELF_URL`
  - `.env.example` is incomplete (missing the `CLIENT_SELF_URL` vars).
- **Paystack**: uses `@paystack/inline-js` for payment processing.

---

## Backend (`tickethub-backend/`)

| Command | Action |
|---|---|
| `npm run dev` | `tsx watch src/server.ts` (hot-reload) |
| `npm run build` | `tsc && tsc-alias` (resolves `@/` path aliases for Node) |
| `npm start` | `node ./dist/src/server.js` (compiled output) |
| `npm run lint` | `eslint 'src/**/*.ts'` |
| `npm run seed-auth` | Seed auth data |
| `npm run seed-events` | Seed events data |
| `npm run seed-organizer` | Seed organizer data |
| `npm run seed-organizer-events` | Seed organizer events |

### Key details

- **Entrypoint**: `src/server.ts` → `src/app.ts` (Express 5 app with graceful shutdown).
- **Express 5** (`^5.2.1`) — has breaking changes from Express 4 (e.g., async error handling built-in, `req.query` typing changes).
- **Drizzle ORM (RC) + MySQL**: schema in `src/db/schema/`, client in `src/db/client.ts`. Migration CLI: `npx drizzle-kit generate` / `npx drizzle-kit migrate` (no npm scripts defined). Config in `drizzle.config.ts`, output dir `./drizzle/`.
- **Path alias**: `@/` → `./src/` (resolved at runtime by `tsc-alias` post-build; `tsx` handles it natively in dev).
- **`verbatimModuleSyntax: true`** → always use `import type` for type-only imports.
- **Strict mode**: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.
- **Seed scripts** live in `scripts/`, import `../src/db/client` directly (no seed framework).
- **Logger**: pino with pino-pretty in development (configured in `src/utils/logger/`).
- **Lint gap**: `.eslintrc.js` extends `'prettier'` but `eslint-config-prettier` is not in `devDependencies`.
- **`.env.example` is outdated**: uses `USER`/`PASSWORD`/`DATABASE`/`HOST` but `src/config/config.ts` reads `DB_USER`/`DB_PASSWORD`/`DB_NAME`/`DB_HOST`. Use the `DB_*` names. See `.env.example` for all other required variables.

### Required env vars (from `src/config/config.ts`)

```
NODE_ENV, PORT, LOG_LEVEL
DB_USER, DB_PASSWORD, DB_NAME, DB_HOST
PAYSTACK_API_TEST_KEY, PAYSTACK_API_PROD_KEY
EMAIL_SENDER, GMAIL_APP_PASSWORD
JWT_EXPIRES_IN, JWT_SECRET
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
FRONTEND_URL
```

### Database schema modules (in `src/db/schema/`)

- `auth.ts` — Users, Roles, UserRoles, Permissions, RolePermissions, OtpVerifications
- `events.ts` — Events, EventsVenues, EventImages, Categories, CategorizedEvents, EventStaff
- `tickets.ts` — Tickets, TicketTypes, TicketConfigurations, EventTickets, TicketOrders, TicketOrderItems, TicketOrderUserDetails
- `finance.ts` — Payments, Payouts, Refunds
- `audit.ts` — AuditLogs

---

## Common gotchas

- **`verbatimModuleSyntax: true` in both projects** — type-only imports **must** use `import type { ... }`. A bare `import { SomeType }` will fail if `SomeType` is only a type.
- **No tests anywhere** — don't look for test files or test commands.
- **No format, typecheck, or typecheck-only scripts** exist in either project.
- **Two separate lockfiles** — always run `npm install` in the correct subdirectory.
- **Branching**: only `main` branch exists.

# Current Project Status
- Progress: 50% Complete. 
- Source of Truth: Refer to `BRIEF.md` for full project specifications and features.
- Critical Rule: Do not delete, refactor, or rewrite existing core architecture unless explicitly told. Only append, integrate, and complete the missing objectives outlined in `BRIEF.md`.

# OpenCode System Rules & Architectural Guidelines

## 1. Core Operating Principle
- **Precedence:** Always thoroughly observe the original codebase's existing architectural patterns first.
- **Ambiguity & Deviations:** If you notice any structural or stylistic deviation in the existing codebase relative to these rules, **STOP IMMEDIATELY**. Do not write code or refactor blindly. Ask the user in the console for explicit instructions on whether to refactor the old code or adapt to it.
- **The Golden Rule is to ALWAYS KEEP IT SIMPLE STUPID** (KISS).

---

## 2. Frontend Architecture (React)

### File Length Constraints (Strict)
- **Component Files:** Maximum **140 lines of code** per file. 
- **Page Files:** Maximum **120 lines of code** per file.
- If an operation or UI element pushes a file past these limits, it must be modularized and broken down further.

### Componentization & Directory Mapping
- **Modularization:** Everything must be thoroughly componentized and broken down into isolated, reusable units.
- **`sections/` Folder:** Contains the granular sub-components engineered for specific page layouts or sections.
- **`pages/` Folder:** Contains only the main page components. These files function as layout orchestrators that import and assemble the sub-components from the `sections/` folder.
- **Naming Conventions:** All folders and files must adhere strictly to clean, conventional, and consistent naming standards (e.g., kebab-case for folders, PascalCase for components).

### API & Data Fetching Layer (3-Tier Rule)
Every API integration must follow this exact sequential architecture:
1. **Tier 1 (Service File):** Create a standalone API service file containing an Axios instance/call to handle the raw HTTP request.
2. **Tier 2 (React Query File):** Create an equivalent TanStack/React Query file (`useQuery` hook or `useMutation` file) that wraps and invokes the Axios service function.
3. **Tier 3 (Component UI):** Import and call the React Query hook/mutation inside the target page or section component where the data is consumed. Never call Axios directly inside a UI component.

---

## 3. Backend Architecture

### Structural Layout
- Follow standard, strict NestJS folder structures (e.g., separating modules, controllers, services, DTOs, and entities into their respective conventional directories).

### Service File Constraint (Strict)
- **Service Files:** Maximum **200 lines of code** per file. 
- Keep services highly cohesive. If logic approaches the 200-line ceiling, delegate responsibilities to helper classes, custom providers, or separate utility modules.

---

## 4. Execution Workflow for OpenCode
- Prior to every file creation or modification, calculate the expected final line count of the target file.
- If your planned implementation will violate the line limits (140 for components, 120 for pages, 200 for NestJS services), use **Plan Mode** to map out a modularized structure *before* executing the code in **Build Mode**.
