# Copilot Instructions for moodle-provis-frontend

## Project Overview
- **Stack:** React (TypeScript), Vite, Tailwind CSS, ESLint, PostCSS
- **Purpose:** Frontend for Moodle provisioning and management, with modals, tables, and admin features.
- **Structure:**
  - `src/components/` — Main UI components and modals (e.g., `AddPluginModal.tsx`, `EnvironmentsTable.tsx`)
  - `src/components/ui/` — Reusable UI primitives (e.g., `button.tsx`, `input.tsx`)
  - `src/hooks/` — Custom React hooks for data fetching and state (e.g., `useAuth.ts`, `useSystemMetrics.ts`)
  - `src/types/` — TypeScript types for core entities (e.g., `user.ts`, `plugin.ts`)
  - `src/styles/` — CSS and Tailwind overrides

## Key Patterns & Conventions
- **Component Structure:**
  - Use function components with TypeScript types from `src/types/`.
  - UI primitives in `src/components/ui/` are used throughout feature components for consistency.
  - Modals are named `*Modal.tsx` and handle their own open/close state.
- **State & Data:**
  - Use hooks from `src/hooks/` for API/data logic; avoid direct fetches in components.
  - Prefer context or prop-drilling for cross-component state, not global stores.
- **Styling:**
  - Use Tailwind CSS utility classes; global styles in `src/styles/globals.css`.
  - Override or extend with `force.css` only for critical fixes.
- **Testing:**
  - No explicit test setup found; clarify with maintainers if adding tests.
- **Linting:**
  - ESLint config in `eslint.config.js` (see README for type-aware rules).
  - Run linting with `npx eslint .` or via Vite plugin.

## Developer Workflows
- **Start Dev Server:** `npm run dev`
- **Build:** `npm run build`
- **Preview Build:** `npm run preview`
- **Lint:** `npx eslint .`
- **Format:** (if Prettier is added) `npx prettier --write .`

## Integration & Data Flow
- **API/Backend:**
  - Data-fetching logic is encapsulated in hooks (e.g., `useAuditLog.ts`, `useSystemMetrics.ts`).
  - No direct backend URLs found; check hooks for API endpoints.
- **Assets:**
  - Static assets in `public/` and `src/assets/`.

## Examples
- **Add a new modal:** Copy an existing `*Modal.tsx` in `src/components/`, use UI primitives from `src/components/ui/`.
- **Add a new hook:** Place in `src/hooks/`, export a function prefixed with `use`.
- **Add a new type:** Place in `src/types/`, use PascalCase for type names.

## References
- See `README.md` for Vite/React/ESLint details.
- See `src/components/` and `src/components/ui/` for component patterns.
- See `src/hooks/` for data-fetching and state logic.

---
If any conventions or workflows are unclear, ask maintainers for clarification or propose updates to this file.
