# CivicTruth

> Immutable Citizen Ledger & AI-Powered Document Verification Platform

CivicTruth is a production-ready, full-stack web application that combines an **immutable SHA-256 blockchain** with **AI-powered verification** to provide a tamper-proof archive for citizen documents and transactions. Built on a **FastAPI async backend** and a **React 19 + Vite** frontend, it delivers role-based access control (admin/participant), real-time blockchain integrity verification, and local AI inference for document authenticity assessment.

---

## Table of Contents

1. [Architecture](#architecture)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [Backend API Reference](#backend-api-reference)
6. [Database Schema](#database-schema)
7. [Blockchain Mechanism](#blockchain-mechanism)
8. [AI Verification](#ai-verification)
9. [Security Model](#security-model)
10. [Frontend Documentation](#frontend-documentation)
11. [Configuration](#configuration)
12. [Production Deployment](#production-deployment)
13. [Testing](#testing)

---

## Architecture

```
CivicTruth/
├── backend/                  # FastAPI async backend
│   ├── app/
│   │   ├── main.py           # FastAPI app factory, middleware, lifespan
│   │   ├── config.py         # Pydantic settings (env vars)
│   │   ├── database.py       # Async SQLAlchemy engine + session
│   │   ├── deps.py           # Auth dependencies (JWT, role checking)
│   │   ├── middleware.py     # Rate-limiting middleware
│   │   ├── models/           # SQLAlchemy ORM models
│   │   │   ├── participant.py
│   │   │   ├── block.py
│   │   │   ├── verification.py
│   │   │   ├── notification.py
│   │   │   └── settings.py
│   │   ├── routers/          # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── blockchain.py
│   │   │   ├── verification.py
│   │   │   ├── participants.py
│   │   │   ├── notifications.py
│   │   │   └── settings.py
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   │   ├── participant.py
│   │   │   ├── block.py
│   │   │   ├── verification.py
│   │   │   ├── notification.py
│   │   │   └── settings.py
│   │   ├── services/         # Business logic services
│   │   │   ├── ai_verification.py
│   │   │   ├── tamper_proof.py
│   │   │   └── image_features.py
│   │   └── utils/
│   │       └── security.py   # JWT, bcrypt, SHA-256 hashing
│   ├── run.py                # Entry point (uvicorn)
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment configuration
├── frontend/                 # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx           # Main app with routing & providers
│   │   ├── main.jsx          # React entry point
│   │   ├── services/
│   │   │   └── api.js        # Axios HTTP client + API modules
│   │   ├── utils/
│   │   │   └── auth.js       # JWT decode & auth helpers
│   │   ├── components/
│   │   │   ├── Layout.jsx            # Sidebar navigation layout
│   │   │   ├── ProtectedRoute.jsx    # Route guard (auth + roles)
│   │   │   └── shared/
│   │   │       ├── Toast.jsx             # Toast notification system
│   │   │       ├── ConfirmDialog.jsx     # Confirmation dialog provider
│   │   │       ├── SettingsContext.jsx   # Settings context provider
│   │   │       ├── ThemeModeContext.jsx  # Light/dark theme context
│   │   │       ├── PageHeader.jsx        # Page title + breadcrumbs
│   │   │       ├── PageContainer.jsx     # Page wrapper component
│   │   │       ├── StatusBadge.jsx       # Status badge + score bar
│   │   │       ├── Dropdown.jsx          # Reusable dropdown
│   │   │       ├── EmptyState.jsx        # Empty state placeholder
│   │   │       ├── ErrorBoundary.jsx     # React error boundary
│   │   │       ├── ConfirmDialog.jsx     # (duplicate, see above)
│   │   │       └── Skeletons.jsx         # Loading skeleton components
│   │   └── pages/
│   │       ├── Home.jsx            # Landing page
│   │       ├── Register.jsx        # Participant registration (3-step form)
│   │       ├── Login.jsx           # Sign-in page
│   │       ├── Blockchain.jsx      # Block creation & chain management
│   │       ├── Verify.jsx          # AI-powered verification
│   │       ├── Dashboard.jsx       # Admin dashboard with stats
│   │       ├── Profile.jsx         # User profile & admin management
│   │       ├── Settings.jsx        # System settings (admin only)
│   │       ├── Participants.jsx    # Participant CRUD (admin only)
│   │       ├── ParticipantDetail.jsx # Single participant view
│   │       └── Notifications.jsx   # System notifications (admin)
│   ├── index.html                  # HTML template
│   ├── vite.config.js              # Vite config with API proxy
│   ├── tailwind.config.js          # Tailwind CSS config
│   └── package.json                # Node dependencies
└── README.md
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend framework** | [FastAPI](https://fastapi.tiangolo.com/) 0.111 (async, Python 3.12+) |
| **Database** | PostgreSQL 14+ via `asyncpg`; SQLite (`aiosqlite`) for local dev |
| **ORM** | SQLAlchemy 2.0 (async, declarative base) |
| **Authentication** | JWT ([PyJWT](https://pyjwt.readthedocs.io/), HS256) + [`bcrypt`](https://github.com/pyca/bcrypt) + HMAC-SHA256 ID hashing |
| **AI / ML** | Hugging Face Transformers — `sentence-transformers/all-MiniLM-L6-v2` (text), `facebook/dinov2-small` (image) |
| **Blockchain** | SHA-256 cryptographic chaining (immutable, append-only) |
| **Frontend** | React 19 + Vite + Tailwind CSS 3 |
| **HTTP client** | Axios with request/response interceptors |
| **Routing** | React Router DOM v6 (protected + role-based routes) |
| **Rate limiting** | Custom Starlette middleware (sliding window per client IP) |
| **Security headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection |

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | 3.12+ | Required for FastAPI + the AI/ML stack |
| Node.js | 18+ | Required for the Vite frontend |
| PostgreSQL | 14+ | Recommended; SQLite is supported for development |
| npm | 9+ | Frontend package manager |

> **Note on model download:** the AI models are downloaded on first inference. The text model (`all-MiniLM-L6-v2`) is ~90 MB; DINOv2-small is ~90 MB. Ensure adequate disk and memory before the first `verify` request.

---

## Quick Start

### 1. Provision the database (PostgreSQL)

```sql
CREATE DATABASE civictruth;
CREATE USER civic WITH PASSWORD 'change-me';
GRANT ALL PRIVILEGES ON DATABASE civictruth TO civic;
```

Tables are created automatically on first startup via SQLAlchemy `Base.metadata.create_all`. The application `lifespan` also applies idempotent column migrations for databases created against earlier schema versions.

### 2. Configure environment

Both the backend and frontend read configuration from `.env` files (already provided; gitignored so secrets are not committed).

The most important value to change is `SECRET_KEY`. Generate a strong one:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### 3. Run the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

The API starts at `http://localhost:8000`. Interactive docs are available at:

- Swagger UI — `http://localhost:8000/docs`
- ReDoc — `http://localhost:8000/redoc`

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

The app starts at `http://localhost:5173`. The Vite dev server proxies `/api` to `http://localhost:8000`.

---

## Backend API Reference

All API routes are prefixed with `/api/v1`.

### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new participant (hashes national ID with HMAC-SHA256, bcrypt password) | No |
| POST | `/login` | Sign in with national ID + password, returns JWT access token | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/me` | Update current user profile (name, email, dob, bio) | Yes |

**Register Request Body:**
```json
{
  "national_id": "string (1-128 chars)",
  "full_name": "string (1-256 chars)",
  "password": "string (8-128 chars)",
  "dob": "string (ISO date, optional)",
  "bio": "string (max 1024 chars, optional)",
  "email": "string (max 256 chars, optional)"
}
```

**Login Request Body:**
```json
{
  "national_id": "string",
  "password": "string"
}
```

**Response (both register & login):**
```json
{
  "access_token": "JWT token",
  "token_type": "bearer",
  "role": "participant" | "admin",
  "participant": {
    "id": "uuid",
    "full_name": "string",
    "national_id_mask": "string (first 4 chars + asterisks)",
    "dob": "ISO date or null",
    "bio": "string or null",
    "email": "string or null",
    "role": "string",
    "is_active": "boolean",
    "created_at": "ISO timestamp"
  }
}
```

### Blockchain (`/api/v1/blockchain`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| POST | `/` | Create a new block (text data or image URL) | Yes | participant (own), admin (any) |
| GET | `/` | List blocks (admin sees all, participants see own) | Yes | All |
| GET | `/{id}` | Get a specific block | Yes | participant (own), admin |
| PUT | `/{id}` | Update a block (admin only; recalculates chain hashes) | Yes | admin |
| DELETE | `/{id}` | Delete a block (admin only; recalculates chain hashes) | Yes | admin |
| GET | `/chain/verify` | Verify the integrity of the entire blockchain | Yes | All |

**Create Block Request Body:**
```json
{
  "participant_id": "uuid",
  "transaction_type": "string (e.g. birth_certificate, id_card, passport, affidavit, property_deed)",
  "transaction_data": "string (optional, max 65535 chars)",
  "image_url": "string URL (optional)"
}
```
At least one of `transaction_data` or `image_url` must be provided.

**Block Response:**
```json
{
  "id": "uuid",
  "participant_id": "uuid",
  "participant_name": "string",
  "transaction_type": "string",
  "transaction_data": "string",
  "data_hash": "SHA-256 hex",
  "block_hash": "SHA-256 hex",
  "ai_verification_score": "string or null",
  "ai_verification_label": "string or null",
  "image_url": "string or null",
  "image_features": "[float] or null",
  "created_at": "ISO timestamp"
}
```

### Verification (`/api/v1/verify`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Run AI verification against blockchain blocks | Yes |

**Verification Request Body:**
```json
{
  "participant_id": "uuid (optional, defaults to current user for non-admins)",
  "block_id": "uuid (optional, verify against a specific block)",
  "input_text": "string (optional, text document to verify)",
  "image_url": "string URL (optional, image to verify)"
}
```
At least one of `input_text` or `image_url` must be provided.

**Verification Response:**
```json
{
  "id": "uuid",
  "participant_id": "uuid or null",
  "block_id": "uuid or null",
  "input_text": "string",
  "ai_model_id": "string",
  "prediction_label": "Exact Match | Partial Match | Mismatch | Unrelated | Fabricated | Uncertain",
  "prediction_score": "float (0.0-1.0)",
  "status": "completed",
  "matched_blocks": "[MatchedBlock]",
  "result_text": "string (detailed analysis summary)",
  "is_exact_match": "boolean",
  "created_at": "ISO timestamp"
}
```

### Participants (`/api/v1/participants`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List participants (paginated, limit 10-100) | Yes | All |
| GET | `/{id}` | Get a specific participant | Yes | All |
| POST | `/` | Create a participant | Yes | admin |
| PUT | `/{id}` | Update a participant | Yes | admin |
| DELETE | `/{id}` | Delete a participant | Yes | admin |

### Notifications (`/api/v1/notifications`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List notifications (global or user-specific) | Yes | All |
| POST | `/` | Create a notification (broadcast to all) | Yes | admin |
| PUT | `/{id}` | Update a notification | Yes | admin |
| PATCH | `/{id}/read` | Mark a notification as read | Yes | All (owner or admin) |
| DELETE | `/{id}` | Delete a notification | Yes | admin |

### Settings (`/api/v1/settings`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| GET | `/` | List all settings | Yes | All |
| GET | `/{id}` | Get a specific setting | Yes | All |
| PUT | `/{id}` | Update a setting | Yes | admin |

Default settings are seeded on first run:
- `enable.notifications` = `true`
- `support.email` = `support@civictruth.io`
- `app.theme` = `light`
- `session.timeout` = `30` (minutes)
- `api.rate.limit` = `100` (requests per minute)
- `site.name` = `CivicTruth`

---

## Database Schema

> **Privacy invariant:** national IDs are **never** stored in plaintext. They are HMAC-SHA256-hashed with `SECRET_KEY` before persistence.

### Participant
Stores registered citizen information. National IDs are never stored in plaintext — they are hashed using HMAC-SHA256 with the application `SECRET_KEY`.

| Field | Type | Notes |
|-------|------|-------|
| `id` | String(36) UUID | Primary key |
| `full_name` | String | Indexed |
| `national_id_hash` | String | Unique, indexed — HMAC-SHA256 hash |
| `dob` | DateTime | Optional |
| `bio` | String | Optional |
| `email` | String | Optional, indexed |
| `password_hash` | String | bcrypt hash |
| `role` | String | `"participant"` or `"admin"` |
| `is_active` | Boolean | Default `true` |
| `created_at` | DateTime | Auto-set |
| `updated_at` | DateTime | Auto-updated |

### Block
An immutable record on the blockchain. Each block is cryptographically linked to the previous one via SHA-256 hashing.

| Field | Type | Notes |
|-------|------|-------|
| `id` | String(36) UUID | Primary key |
| `participant_id` | String(36) FK | References `participants.id` |
| `transaction_type` | String | e.g. `birth_certificate`, `id_card`, `passport` |
| `transaction_data` | Text | The document/content data |
| `data_hash` | String | SHA-256 of transaction data + image URL |
| `parent_hash` | String | Hash of the previous block (null for genesis) |
| `block_hash` | String | SHA-256 of `data_hash + parent_hash + timestamp` |
| `ai_verification_score` | String | AI confidence score (stored as string) |
| `ai_verification_label` | String | AI classification label |
| `image_url` | String | Optional image URL |
| `image_features` | Text | JSON array of DINOv2 embedding floats |
| `created_at` | DateTime | Auto-set |

### VerificationRecord
Stores the results of AI verification operations.

| Field | Type | Notes |
|-------|------|-------|
| `id` | String(36) UUID | Primary key |
| `participant_id` | String(36) FK | Optional |
| `block_id` | String(36) FK | Optional |
| `input_text` | Text | The text that was verified |
| `input_image_url` | String | Optional image URL |
| `ai_model_id` | String | `"local"` or `"dinov2-small"` |
| `prediction_label` | String | Verification result label |
| `prediction_score` | Float | Confidence score (0.0-1.0) |
| `verified_by` | String | Optional |
| `status` | String | Default `"pending"`, set to `"completed"` |
| `created_at` | DateTime | Auto-set |

### Notification
System-wide or user-specific alerts.

| Field | Type | Notes |
|-------|------|-------|
| `id` | String(36) UUID | Primary key |
| `title` | String(256) | Required |
| `message` | Text | Required |
| `created_by` | String(36) FK | References `participants.id` |
| `participant_id` | String(36) FK | Optional (null = global) |
| `is_read` | Boolean | Default `false` |
| `created_at` | DateTime | Auto-set |

### Setting
Key-value configuration store for application settings.

| Field | Type | Notes |
|-------|------|-------|
| `id` | String(36) UUID | Primary key |
| `key` | String(128) | Unique, indexed |
| `value` | Text | Optional |
| `value_type` | String(32) | `"string"`, `"int"`, `"bool"`, `"json"` |
| `description` | Text | Optional |
| `created_at` | DateTime | Auto-set |
| `updated_at` | DateTime | Auto-updated |

---

## Blockchain Mechanism

The chain is a simple **hash-linked list** with an append-only policy for non-admin users.

1. **Data hash** — `data_hash = SHA-256(transaction_data + "\n[image:<url>]")`
2. **Block hash** — `block_hash = SHA-256(data_hash + parent_hash + timestamp.isoformat())`
3. **Genesis** — the first block's `parent_hash` is the zero string `"0" * 64`.

### Integrity Verification

`GET /api/v1/blockchain/chain/verify` iterates blocks in chronological order (with a deterministic `id` tiebreaker) and confirms, for every block:

- the stored `data_hash` matches the recomputed payload hash, and
- the stored `parent_hash` equals the previous block's `block_hash`.

The verification short-circuits at the first broken link, reporting the offending block id and a per-block breakdown.

### Mutation Policy

- **Participants** may create and read their own blocks; they **cannot** edit or delete.
- **Admins** may edit/delete, but any mutation triggers automatic re-hashing of all **subsequent** blocks to preserve chain integrity.

---

## AI Verification

### Text Verification

Text is encoded with `sentence-transformers/all-MiniLM-L6-v2` (mean-pooled, L2-normalized) and compared to stored records via cosine similarity:

| Label | Threshold |
|-------|-----------|
| Exact Match | similarity > 0.85 |
| Partial Match | similarity > 0.65 |
| Mismatch | similarity > 0.40 |
| Unrelated | otherwise |

When no reference text is supplied, the text is classified against a fixed label set (Factual, Opinion, Misleading, Plausible, Irrelevant). Scores below the configured threshold (default **0.60**) are reported as `Uncertain`.

### Image Verification

Images are passed through `facebook/dinov2-small` to extract a feature vector, then compared to stored image features with cosine similarity using the same thresholds as text.

### Runtime Behavior

- Models are **lazily loaded** and **cached** in-process (thread-safe, guarded by `asyncio.Lock`).
- Inference runs on CPU by default (`HF_DEVICE=cpu`); set `HF_DEVICE=cuda` to use a GPU.
- Remote images are streamed with a **10 MB cap** (mitigates decompression bombs and SSRF-style abuse).

---

## Security Model

CivicTruth enforces security at multiple layers.

### Authentication & Authorization

- **HMAC-SHA256 ID hashing** — national IDs are never stored in plaintext.
- **bcrypt password hashing** — with a 72-byte input cap.
- **JWT (HS256)** — signed with `SECRET_KEY`; includes `sub`, `role`, `full_name`, `national_id_hash`, `iss`, `iat`, `exp`.
- **Role-based access control** — participants access only their own data; admins have full access.
- **`HTTPBearer` returns 401** (not 403) for missing/expired/invalid credentials.

### Transport & Resilience

- **Security headers** — `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`.
- **Host allow-list** — `TrustedHostMiddleware` validates the `Host` header (disabled with `ALLOWED_HOSTS=*`).
- **Rate limiting** — sliding window per client IP, honoring `X-Forwarded-For` behind a proxy.
- **CORS** — explicit allow-list via `CORS_ORIGINS`.
- **Proxy-aware** — the default Docker/uvicorn command enables `--proxy-headers`.

### Data Integrity

- **Append-only blockchain** — admin mutations re-hash the remainder of the chain.
- **Public auditability** — `GET /blockchain/chain/verify` recomputes all hashes on demand.
- **Image download guards** — 10 MB stream cap against resource-exhaustion attacks.

### Known Considerations

- Tokens are stored in `localStorage` (standard for this kind of SPA). For stricter requirements, migrate to **httpOnly cookies** with CSRF protection.
- No built-in token refresh; re-authentication is required after the configured expiry.

---

## Frontend Documentation

### Project Structure

```
frontend/src/
├── App.jsx                    # Root component with routing, providers, theme
├── main.jsx                   # ReactDOM entry point
├── index.css                  # Global styles + Tailwind directives
├── services/
│   └── api.js                 # Axios instance + named API modules
├── utils/
│   └── auth.js                # JWT decode helpers (role, user info, expiry)
├── components/
│   ├── Layout.jsx             # Sidebar navigation + header + mobile drawer
│   ├── ProtectedRoute.jsx     # Route guard (auth + role check)
│   └── shared/
│       ├── Toast.jsx          # Toast notification provider + component
│       ├── ConfirmDialog.jsx  # Confirmation dialog provider + hook
│       ├── SettingsContext.jsx # Settings context (fetched from API)
│       ├── ThemeModeContext.jsx # Light/dark theme context
│       ├── PageHeader.jsx     # Page title, subtitle, breadcrumbs, action
│       ├── PageContainer.jsx  # Page content wrapper
│       ├── StatusBadge.jsx    # Status badge + score bar + loading overlay
│       ├── Dropdown.jsx       # Reusable select/dropdown component
│       ├── EmptyState.jsx     # Empty state placeholder with action
│       ├── ErrorBoundary.jsx  # React error boundary
│       └── Skeletons.jsx      # Loading skeleton cards & tables
└── pages/
    ├── Home.jsx               # Landing page with features & how-it-works
    ├── Register.jsx           # 3-step registration form (personal, identity, security)
    ├── Login.jsx              # Sign-in form with password visibility toggle
    ├── Blockchain.jsx         # Block CRUD + chain integrity panel
    ├── Verify.jsx             # AI verification (text or image) + results
    ├── Dashboard.jsx          # Admin dashboard (stats, chain, recent entries)
    ├── Profile.jsx            # User profile + admin participant management
    ├── Settings.jsx           # System settings (admin only)
    ├── Participants.jsx       # Participant list + CRUD (admin only)
    ├── ParticipantDetail.jsx  # Single participant view + transaction history
    └── Notifications.jsx      # Notification list + send alert (admin)
```

### Routing

| Path | Component | Auth | Role | Description |
|------|-----------|------|------|-------------|
| `/` | Home | No | Any | Landing page |
| `/login` | Login | No | Any | Sign-in page |
| `/register` | Register | No | Any | Participant registration |
| `/blockchain` | Blockchain | Yes | participant, admin | Create & manage blockchain blocks |
| `/verify` | Verify | Yes | participant, admin | AI-powered document/image verification |
| `/dashboard` | Dashboard | Yes | admin | Admin dashboard with stats & chain status |
| `/participants` | Participants | Yes | admin | Participant management (CRUD) |
| `/participants/:participantId` | ParticipantDetail | Yes | admin | Single participant detail view |
| `/notifications` | Notifications | Yes | participant, admin | System notifications |
| `/profile` | Profile | Yes | participant, admin | User profile & settings |
| `/settings` | Settings | Yes | admin | System configuration |
| `*` | — | — | — | Redirects to `/` |

### API Service Layer (`services/api.js`)

The API client uses Axios with:

- Base URL from `VITE_API_URL` (fallback `/api/v1`).
- A 30-second timeout.
- Automatic `Authorization: Bearer <token>` header injection.
- On `401` (other than login/register), clears the token and redirects to `/login?redirect=<path>`, preserving the user's intended destination.

Named modules: `authAPI`, `participantsAPI`, `blockchainAPI`, `settingsAPI`, `notificationsAPI`, `verifyAPI`.

### Auth Utilities (`utils/auth.js`)

Centralizes token handling in one place:

| Helper | Purpose |
|--------|---------|
| `decodeToken(token)` | Safely parse a JWT payload (validates 3-part structure) |
| `getToken()` / `setToken()` | Read/write the stored token |
| `getRoleFromToken()` | Return the `role` claim |
| `getUserIdFromToken()` | Return the `sub` claim |
| `getUserInfoFromToken()` | Return `{ name, identifier, role }` |
| `isTokenExpired()` | Check the `exp` claim |
| `clearAuthToken()` | Remove the token |

> **Important:** client-side decoding is for **UI display only**. All authorization is re-validated server-side on every request; the decoded JWT is never treated as an authorization boundary.

### Key Frontend Features

#### Registration (3-Step Form)
1. **Personal Info** — Full name, email
2. **Identity** — National ID (hashed before storage), date of birth, bio
3. **Security** — Password with strength meter (8+ chars, uppercase, lowercase, number, symbol), confirm password, terms acceptance

#### Blockchain Management
- Create blocks with text data or image URLs
- Admin can select any participant; participants can only create for themselves
- Transaction types: `birth_certificate`, `id_card`, `passport`, `affidavit`, `property_deed`
- Real-time chain integrity panel with percentage score and per-block status
- Search/filter blocks by participant name, type, or hash
- Edit blocks (admin) with automatic chain re-hashing
- Delete blocks (admin) with confirmation dialog

#### AI Verification
- Submit text documents or image URLs for verification
- Admin can optionally select a specific participant or block to verify against
- Results show prediction label, confidence score, analysis summary, and matched blockchain entries
- Verification history persisted in localStorage (last 10 results)

#### Dashboard (Admin)
- Four stat cards: Registered Participants, Chain Integrity, Total Documents, Active Participants
- Chain integrity card with refresh and detailed block-by-block status
- Recent blockchain entries table with quick-verify links
- Registered participants table with status indicators

#### Settings (Admin)
- System settings management (key-value store)
- Notification toggles, support email
- Appearance (theme: light/dark/system)
- Security (session timeout)
- System (API rate limit, site name)
- Inline editing with modal form

#### Notifications (Admin)
- Send broadcast notifications to all participants
- Mark notifications as read
- Edit and delete notifications
- Unread indicator with blue dot

#### Profile
- View and edit personal information (name, email, dob, bio)
- Permissions overview (view blockchain, run verification, admin access, blockchain write)
- Activity log (login, block created, verification run)
- Admin participant management section (edit/delete other participants)

### Theme System
The frontend supports light/dark theme switching:
- Theme preference is stored in localStorage
- Can be overridden by the `app.theme` system setting
- Respects `prefers-color-scheme: dark` on first visit
- Applied via `data-theme` attribute on `<html>` element

### Responsive Design
- Mobile-first responsive layout with collapsible sidebar
- Mobile hamburger menu with overlay drawer
- Sidebar collapses to icon-only on desktop
- Header adapts for mobile (profile menu dropdown)

---

## Configuration

### Backend Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | *(required)* | Secret for JWT signing and HMAC ID hashing (min **32 bytes**) |
| `DATABASE_URL` | `postgresql+asyncpg://postgres:mysecretpassword@localhost:5432/civictruth` | SQLAlchemy async connection string (`postgresql+asyncpg` or `sqlite+aiosqlite`) |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT lifetime (minutes) |
| `HF_MODEL_ID` | `sentence-transformers/all-MiniLM-L6-v2` | Text-embedding model |
| `DINOV2_MODEL_ID` | `facebook/dinov2-small` | Image-feature model |
| `HF_DEVICE` | `cpu` | Inference device (`cpu` or `cuda`) |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed CORS origins |
| `ALLOWED_HOSTS` | `*` | Comma-separated host allow-list (`*` disables the check) |
| `ENV` | `development` | `development` \| `production` \| `test` \| `staging` |
| `LOG_LEVEL` | `INFO` | Python logging level |
| `RATE_LIMIT_PER_MINUTE` | `100` | Requests/minute/IP enforced by the rate limiter |

All values are validated at import time; invalid configuration raises a clear error instead of failing later.

### Frontend Environment Variables (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api/v1` | API base URL (keep `/api/v1` in dev for the proxy; set full URL in production) |

### Runtime Settings (stored in the database)

Seeded on first run and editable through the admin **Settings** screen:

| Key | Default | Description |
|-----|---------|-------------|
| `enable.notifications` | `true` | Toggle in-app notifications |
| `support.email` | `support@civictruth.io` | Support address shown to users |
| `app.theme` | `light` | Default theme (`light`/`dark`) |
| `session.timeout` | `30` | Session timeout in minutes |
| `api.rate.limit` | `100` | Displayed rate limit |
| `site.name` | `CivicTruth` | Public site name |

---

## Production Deployment

A production-ready container image is provided (`backend/Dockerfile`):

- Multi-stage build (Python 3.12 slim).
- Runs as a non-root user.
- Includes a `/health` HTTP health check.
- Enables `--proxy-headers` so `X-Forwarded-For` is honored behind nginx/ALB.

### Recommended production checklist

1. Set a strong, random `SECRET_KEY`.
2. Use a managed PostgreSQL instance.
3. Set `ENV=production` (suppresses stack traces in error responses).
4. Restrict `CORS_ORIGINS` and set a real `ALLOWED_HOSTS` allow-list.
5. Terminate TLS at a reverse proxy (nginx/Caddy) — the app assumes HTTPS via HSTS.
6. Pin `HF_DEVICE`/`HF_MODEL_ID`/`DINOV2_MODEL_ID` intentionally.
7. Persist the database volume; the AI models are cached in memory per replica.
8. Increase `RATE_LIMIT_PER_MINUTE` only if observability justifies it.

---

## Testing

The project has no automated test suite at present. Recommended next steps:

```bash
# Backend (after adding pytest-asyncio + httpx)
cd backend && pip install pytest pytest-asyncio anyio
pytest

# Frontend
cd frontend && npm run lint && npm run build
```

Suggested coverage: auth flows, blockchain hash integrity (append/update/delete), verification scoring, and rate-limit middleware behavior.