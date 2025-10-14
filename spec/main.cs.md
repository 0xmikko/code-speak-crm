// This is a comment. This line is ignored.

### Decentralized Protocol CRM — v1 Specification

#### Tech Stack

- Next.js (App Router, TypeScript)
- Postgres (managed), Drizzle ORM and Drizzle Kit migrations
- Auth: Google OAuth (via NextAuth.js with Google provider)
- UI: Tailwind CSS + Headless UI; Kanban: `react-kanban`
- Package manager: pnpm (ts-pnpm)

#### Architecture & Conventions

- DDD-inspired modular structure: `domains/{assets,protocols,lps,users,auth,curators}` with clear boundaries.
- No default exports; use named exports only.
- Do not any type anywhere, if it's not a strict requirement from imported lab
- Environment variables loaded via `@/config/env` and validated with Zod.
- Drizzle schema colocated per domain; a top-level `drizzle.config.ts` aggregates.

#### Navigation & Layout

- Left-side vertical tab bar with four tabs: Assets, Protocols, LPs, Users.
- Top bar: global search field (center-left) and Login/Profile button (top-right).
- Unauthenticated users land on a start screen with brief app intro and a Sign In with Google button.
- Authenticated users are routed to Assets by default.

#### Authorization & Access

- Google OAuth required for app access beyond the start screen.
- First version: omit approval flows. A boolean flag `is_valid_user` in `users` controls access to app features.
- After sign-up, `is_valid_user=false` by default; an admin sets it `true` manually in DB.
- Route protection: all domain pages require authenticated session AND `is_valid_user=true`.

#### Domains & Features

- Assets
  - View: Kanban board (`react-kanban`) reflecting pipeline stages for assets in-flight.
  - Stages (left→right): Request → Business due diligence → Tech. due diligence → Building integration → Audit → Building bundle → Testing → Production.
  - Card shows: Asset symbol, protocol name, chainId, and current owner/assignee.
  - Drag-and-drop requests a stage change; validation enforces stage gating (see UI Details). On success, record transition with timestamp and actor; on failure, show warning and do not move.
  - Details drawer per card with stage-specific fields (see Data Model). Clicking a card opens the drawer and allows editing of fields for the current stage (everyone for v1).
  - "Create Asset" button opens a modal to create an Asset Request with required fields and validation.

- Protocols
  - Grid of protocol cards; each card shows protocol name, logo/avatar, brief summary.
  - Clicking a protocol opens a details drawer/page with Contacts list.
  - Contacts fields: name, role (optional), phone, Telegram handle, GitHub, avatar URL.
  - Protocols are linked from assets (each asset optionally references a protocol).

- LPs
  - List/grid of Liquidity Providers with status and per-chain addresses.
  - LP status reflects relationship known-from-app: enum `unknown | prospect | active | paused`.
  - Each LP has contacts (same structure as protocols) and `lp_chain_addresses` entries.
  - Minimal v1: CRUD table with expandable row for contacts and addresses.


#### Data Model (Drizzle schema outline)

- users
  - id (uuid, pk)
  - email (text, unique)
  - name (text)
  - image_url (text, nullable)
  - is_valid_user (boolean, default false)
  - created_at (timestamptz, default now)

- curators
  - id (uuid, pk)
  - user_id (uuid, fk→users.id, unique)
  - bio (text, nullable)
  - expertise_tags (text[], nullable)
  - created_at (timestamptz)

- assets
  - id (uuid, pk)
  - asset_symbol (text)
  - asset_address (text)
  - chain_id (integer)
  - protocol_id (uuid, fk→protocols.id, nullable)
  - source (enum: partner | analyst)
  - current_stage (enum: request | business_dd | tech_dd | building_integration | audit | building_bundle | testing | production)
  - owner_user_id (uuid, fk→users.id, nullable)
  - created_at (timestamptz)

- asset_stage_transitions
  - id (uuid, pk)
  - asset_id (uuid, fk→assets.id)
  - from_stage (enum as above)
  - to_stage (enum as above)
  - moved_by_user_id (uuid, fk→users.id)
  - moved_at (timestamptz)

- asset_request_fields
  - asset_id (uuid, pk, fk→assets.id)
  - asset_symbol (text)
  - asset_address (text)
  - chain_id (integer)
  - protocol_id (uuid, fk→protocols.id, nullable)
  - source (enum: partner | analyst)

- asset_business_dd
  - asset_id (uuid, pk, fk→assets.id)
  - interested_curator_ids (uuid[] of fk→curators.id)
  - notes (text, nullable)

- asset_tech_dd
  - asset_id (uuid, pk, fk→assets.id)
  - price_oracle_needed (boolean)
  - adapter_needed (boolean)
  - phantom_token_needed (boolean)
  - developer_user_id (uuid, fk→users.id, nullable)
  - audit_eta (timestamptz, nullable)

- asset_integration_build
  - asset_id (uuid, pk, fk→assets.id)
  - build_status (enum: not_started | in_progress | done)
  - ai_audit_status (enum: not_started | in_progress | done)
  - internal_audit_status (enum: not_started | in_progress | done)

- protocols
  - id (uuid, pk)
  - name (text, unique)
  - logo_url (text, nullable)
  - summary (text, nullable)
  - created_at (timestamptz)

- protocol_contacts
  - id (uuid, pk)
  - protocol_id (uuid, fk→protocols.id)
  - name (text)
  - role (text, nullable)
  - phone (text, nullable)
  - telegram (text, nullable)
  - github (text, nullable)
  - avatar_url (text, nullable)
  - created_at (timestamptz)

- lps (liquidity providers)
  - id (uuid, pk)
  - name (text)
  - contact_email (text, nullable)
  - status (enum: unknown | prospect | active | paused)
  - notes (text, nullable)
  - created_at (timestamptz)

- lp_contacts
  - id (uuid, pk)
  - lp_id (uuid, fk→lps.id)
  - name (text)
  - role (text, nullable)
  - phone (text, nullable)
  - telegram (text, nullable)
  - github (text, nullable)
  - avatar_url (text, nullable)

- lp_chain_addresses
  - id (uuid, pk)
  - lp_id (uuid, fk→lps.id)
  - chain_id (integer)
  - address (text)
  - label (text, nullable)

- next_auth tables (via adapter)
  - accounts, sessions, verification_tokens (managed by NextAuth adapter for Postgres)


#### UI Details

- Assets Kanban
  - Columns map 1:1 to stages; each column loads paginated cards.
  - Card click opens a drawer with tabs: Overview, Business DD, Tech DD, Integration Build.
  - Create flow: a primary "Create Asset" button opens a modal with initial request fields (`asset_symbol`, `asset_address`, `chain_id`, `protocol` (optional link), `source`). All are validated; submission creates `assets` and `asset_request_fields` records.
  - Stage gating: attempting to drag a card forward triggers server-side validation that required fields for the next stage are present (per Data Model). If validation fails, show a non-intrusive warning toast and revert the drag; do not change stage. On success, persist `asset_stage_transitions` and update `assets.current_stage`.
  - Edit-on-click: while the drawer is open, fields for the current stage are editable by any authenticated valid user (v1). Future versions will restrict by role/ownership.
  - Stage transitions disabled unless user is authenticated and `is_valid_user=true`.

- Global Search
  - v1: search by asset symbol/protocol name; future: federated search across tabs.
  - No need to add full-text or vector databases

- Auth States
  - Start screen for unauthenticated users with Sign In (Google).
  - Profile menu (top-right) shows email, sign out, and link to Users tab if admin.

#### User Flows

- Unauthenticated → Sign In
  - User opens app and sees the start screen with a Sign In with Google button.
  - After OAuth, if `is_valid_user=false`, show a Restricted Access screen ("Pending access; an admin will enable your account") and provide Sign Out; do not allow navigating tabs.
  - If `is_valid_user=true`, route to `Assets`.

- Authenticated (valid) → Default landing
  - User lands on `Assets` with the left-side vertical tabs and top search/profile controls.

- Create Asset (Request stage)
  - User clicks the primary "Create Asset" button on `Assets`.
  - Modal fields: `asset_symbol`, `asset_address`, `chain_id`, `protocol` (optional link to `protocols`), `source` (`partner | analyst`).
  - Client- and server-side validation; on success, create `assets` and `asset_request_fields`; place the card in the Request column.
  - On error, show inline field errors and a toast; do not create records.

- Edit Asset (per-stage)
  - User clicks a card to open the drawer. For v1, any authenticated valid user can edit fields of the current stage.
  - Changes are saved via explicit Save action; optimistic UI with rollback on server error.

- Stage Transitions & Validation
  - Dragging a card to a next-stage column triggers server-side validation. If validation fails, show a warning toast and revert the drag; otherwise persist transition and update `assets.current_stage`.
  - Gating rules:
    - Request → Business DD: all request fields present and valid; asset uniqueness by (`chain_id`, `asset_address`).
    - Business DD → Tech DD: at least one interested curator linked in `asset_business_dd`.
    - Tech DD → Building integration: booleans set for `price_oracle_needed`, `adapter_needed`, `phantom_token_needed`; if any is true, `developer_user_id` must be set. `audit_eta` optional.
    - Building integration → Audit: `build_status=done`, `ai_audit_status=done`, `internal_audit_status=done` in `asset_integration_build`.
    - Audit → Building bundle: no additional required fields in v1.
    - Building bundle → Testing: no additional required fields in v1.
    - Testing → Production: no additional required fields in v1.
  - Backward moves (right→left) are allowed without validation and are recorded as transitions.

- Protocols
  - User navigates to `Protocols`, sees protocol cards; clicking opens details with Contacts.

- LPs
  - User navigates to `LPs`, sees LP list with `status` and per-chain addresses; rows expand to view/edit contacts and addresses.

#### Non-Functional

- Type-safe end-to-end (TypeScript), strict mode on.
- Migrations tracked with Drizzle Kit; CI runs drift check.
- Logging via Next.js instrumentation; DB errors surfaced with safe messages.

#### Out of Scope (v1)

- User approval workflow (manual DB flag only).
- Detailed batch/building bundle and testing metadata.
- Notifications and webhooks.
- Role-based permissions beyond simple admin flag for toggling `is_valid_user`.

