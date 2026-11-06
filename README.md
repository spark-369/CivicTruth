# CivicTruth — Tamper-Proof Document Archive & AI Verification Platform

CivicTruth is a full-stack platform that stores civic/demographic records as an
**immutable, hash-linked blockchain ledger** and offers **AI-powered
verification** of submitted documents (text and images) against the ledger. It
combines a hardened **FastAPI / async SQLAlchemy** backend with a modern
**React 19 + Vite + Tailwind CSS** single-page application.

The system is organised around a small set of core ideas:

- **Immutable ledger** — every record is a *block* whose SHA-256 hash is chained
  to the previous block, so any tampering is detectable via `/blockchain/chain/verify`.
- **Identity-safe accounts** — national IDs are never stored in the clear; only an
  HMAC-SHA256 digest (`national_id_hash`) is persisted, and passwords are bcrypt-hashed.
- **Local AI verification** — text and image authenticity is assessed with
  locally-run HuggingFace models (`sentence-transformers/all-MiniLM-L6-v2` and
  `facebook/dinov2-small`) plus cosine similarity — no third-party AI API calls.
- **Role-based access** — `admin` and `participant` roles gate both the API
  (enforced server-side) and the UI (client-side convenience only).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Repository Structure](#repository-structure)
4. [Backend](#backend)
   - [Configuration & Environment Variables](#configuration--environment-variables)
   - [Running the Backend](#running-the-backend)
   - [Docker](#docker)
   - [Application Lifecycle](#application-lifecycle)
   - [Middleware & Security Headers](#middleware--security-headers)
   - [Authentication & Authorization](#authentication--authorization)
   - [Data Model](#data-model)
   - [API Reference](#api-reference)
   - [Tamper-Proof Hash Chain](#tamper-proof-hash-chain)
   - [AI Verification Services](#ai-verification-services)
   - [Backend Testing](#backend-testing)
5. [Frontend](#frontend)
   - [Frontend Configuration & Environment Variables](#frontend-configuration--environment-variables)
   - [Running the Frontend](#running-the-frontend)
   - [Build & Preview](#build--preview)
   - [Routing & Access Control](#routing--access-control)
   - [State, Context & Theming](#state-context--theming)
   - [API Client](#api-client)
   - [Component Catalog](#component-catalog)
6. [Local Development Workflow](#local-development-workflow)
7. [Security Notes](#security-notes)

---

## Architecture Overview

```
┌───────────────────────────────────────────────────────────────────────┐
│                         Browser (SPA)                                  │
│  React 19 • React Router 6 • Axios • Tailwind CSS • Vite               │
│  JWT in localStorage • Theme (light/dark) • Context providers          │
└───────────────────────────────┬───────────────────────────────────────┘
                                │  HTTPS  /api/v1/*  (Bearer JWT)
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend (ASGI)                          │
│  Middleware: TrustedHost → SecurityHeaders → CORS → RateLimit          │
│  Routers:  /auth  /blockchain  /verify  /participants                  │
│            /settings  /notifications                                   │
│  Deps:     get_current_user • require_role(...)                        │
│  Services: tamper_proof • ai_verification • image_features            │
└───────────────┬───────────────────────────────────────┬───────────────┘
                │ Async SQLAlchemy 2.0                    │ Local models
                ▼                                         ▼
        ┌───────────────────┐                 ┌─────────────────────────┐
        │  PostgreSQL       │                 │ sentence-transformers   │
        │  (or SQLite/MySQL)│                 │ all-MiniLM-L6-v2        │
        └───────────────────┘                 │ facebook/dinov2-small   │
                                              └─────────────────────────┘
```

The frontend is a pure client of the versioned REST API; all authorization
decisions are re-enforced on the server for every request.

---

## Tech Stack

### Backend

| Concern            | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| Web framework      | FastAPI `0.111.0` (ASGI)                                |
| ASGI server        | Uvicorn `[standard]` `0.30.0`                           |
| ORM / DB           | SQLAlchemy `2.0.30` (async) with `AsyncSession`         |
| Drivers            | `asyncpg` (PostgreSQL), `aiosqlite` (SQLite)            |
| Validation/config  | Pydantic v2 + `pydantic-settings` `2.2.1`, `python-dotenv` |
| Auth               | PyJWT `2.8.0` (HS256), bcrypt `4.1.3`                   |
| AI / ML            | `transformers` `4.41.2`, `torch` `2.3.1` (CPU), `huggingface-hub` |
| HTTP client (AI)   | `httpx` `0.27.0`                                        |
| Testing            | `pytest` + FastAPI `TestClient`                         |
| Runtime            | Python 3.12                                             |

### Frontend

| Concern        | Technology                                    |
| -------------- | --------------------------------------------- |
| UI library     | React `19` + React DOM `19`                   |
| Routing        | `react-router-dom` `6.23`                     |
| HTTP           | `axios` `1.7`                                 |
| Build tool     | Vite `8` (`@vitejs/plugin-react`)             |
| Styling        | Tailwind CSS `3.4` + PostCSS + Autoprefixer   |
| Linting        | ESLint `10` (flat config) + react-hooks/refresh plugins |
| Language       | JavaScript / JSX (ES modules)                 |

---

## Repository Structure

```
v1/
├── README.md                     # This document
├── backend/
│   ├── Dockerfile                # Multi-stage CPU-only build (Python 3.12-slim)
│   ├── requirements.txt          # Pinned Python dependencies
│   ├── app/
│   │   ├── __init__.py           # Re-exports settings, engine, Base
│   │   ├── main.py               # FastAPI app, lifespan, middleware, routers
│   │   ├── config.py             # Pydantic Settings + validators
│   │   ├── database.py           # Async engine, sessionmaker, get_db()
│   │   ├── deps.py               # get_current_user, require_role
│   │   ├── middleware.py         # RateLimitMiddleware, get_client_ip
│   │   ├── models/               # SQLAlchemy ORM models
│   │   │   ├── participant.py    # participants
│   │   │   ├── block.py          # blocks
│   │   │   ├── verification.py   # verification_records
│   │   │   ├── settings.py       # settings
│   │   │   └── notification.py   # notifications
│   │   ├── schemas/              # Pydantic request/response models
│   │   ├── routers/              # HTTP endpoints (one module per resource)
│   │   │   ├── auth.py           # /auth
│   │   │   ├── blockchain.py     # /blockchain
│   │   │   ├── verification.py   # /verify
│   │   │   ├── participants.py   # /participants
│   │   │   ├── settings.py       # /settings
│   │   │   └── notifications.py  # /notifications
│   │   ├── services/             # Business logic
│   │   │   ├── tamper_proof.py   # Hash chain: append/verify/hash helpers
│   │   │   ├── ai_verification.py# Text embeddings + label selection
│   │   │   └── image_features.py # DINOv2 image embeddings
│   │   └── utils/
│   │       ├── security.py       # bcrypt, HMAC, JWT helpers
│   │       └── time.py           # UTC-naive datetime helpers
│   └── tests/                    # pytest end-to-end + unit suite
│       ├── conftest.py           # Fixtures, SQLite tmp DB, AI stubs
│       ├── test_auth.py          test_blockchain.py   test_health.py
│       ├── test_verification.py  test_participants.py test_settings.py
│       └── test_notifications.py test_middleware.py   test_utils.py
└── frontend/
    ├── index.html                # SPA entry (skip-link, meta, favicon)
    ├── package.json
    ├── vite.config.js            # Dev proxy → backend, build target
    ├── tailwind.config.js        # Theme tokens, dark mode, animations
    ├── postcss.config.js         eslint.config.js
    └── src/
        ├── main.jsx              # ReactDOM root, StrictMode
        ├── App.jsx               # Router, providers, theme logic
        ├── index.css             # Tailwind layers + design tokens/classes
        ├── services/api.js       # Axios instance + typed API groups
        ├── utils/auth.js         # JWT decode, token storage helpers
        ├── components/           # Layout, ProtectedRoute, shared/ primitives
        └── pages/                # Route-level screens
```

---

## Backend

### Configuration & Environment Variables

Configuration is loaded via `app/config.py` using `pydantic-settings`
`BaseSettings`. A `.env` file in the backend working directory is loaded
automatically (`load_dotenv()`); environment variables take precedence.

| Variable                      | Default                                                                     | Notes |
| ----------------------------- | --------------------------------------------------------------------------- | ----- |
| `DATABASE_URL`                | `postgresql+asyncpg://postgres:mysecretpassword@localhost:5432/civictruth`  | Must start with `postgresql`, `mysql`, or `sqlite`. For SQLite use `sqlite+aiosqlite:///./file.db`. |
| `SECRET_KEY`                  | *(required, no default)*                                                    | **Must be ≥ 32 bytes.** Signs JWTs and keys HMAC national-ID hashes. Validated at startup. |
| `ALGORITHM`                   | `HS256`                                                                     | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (24h)                                                                | Default token lifetime; overridable per-login by the `session.timeout` setting. |
| `HF_MODEL_ID`                 | `sentence-transformers/all-MiniLM-L6-v2`                                    | Text embedding model. |
| `DINOV2_MODEL_ID`             | `facebook/dinov2-small`                                                     | Image embedding model. |
| `HF_DEVICE`                   | `cpu`                                                                       | Torch device for the image model (`cpu`, `cuda`, …). |
| `CORS_ORIGINS`                | `http://localhost:5173`                                                     | Comma-separated browser-origin allowlist. |
| `ENV`                         | `development`                                                               | One of `development`, `production`, `test`, `staging`. Controls error verbosity. |
| `LOG_LEVEL`                   | `INFO`                                                                      | `DEBUG`/`INFO`/`WARNING`/`ERROR`/`CRITICAL`. |
| `ALLOWED_HOSTS`               | `*`                                                                         | Comma-separated Host allowlist. `*` disables `TrustedHostMiddleware`. |
| `RATE_LIMIT_PER_MINUTE`       | `100`                                                                       | Requests per client IP per 60s window. |

**Startup validators (fail fast):**

- `SECRET_KEY` — must encode to ≥ 32 bytes.
- `DATABASE_URL` — must be `postgresql*`, `mysql*`, or `sqlite*`.
- `ENV` — must be one of the four allowed values (case-insensitive, lower-cased).
- `LOG_LEVEL` — must be a valid Python logging level (upper-cased).

If validation fails, the app raises `RuntimeError(...)` instructing you to set a
secure `SECRET_KEY`. Generate one with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Example `backend/.env`:

```dotenv
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/civictruth
SECRET_KEY=replace-with-a-48-byte-random-string-xxxxxxxxxxxxxxxx
ENV=development
CORS_ORIGINS=http://localhost:5173
ALLOWED_HOSTS=localhost,127.0.0.1
RATE_LIMIT_PER_MINUTE=100
```

### Running the Backend

Prerequisites: **Python 3.12** and (recommended) a running **PostgreSQL**.
SQLite works locally with `sqlite+aiosqlite:///./civictruth.db`.

```bash
cd backend

python -m venv .venv
source .venv/bin/activate            # Windows: .venv\Scripts\activate

# PyTorch CPU wheel is pulled from the CPU index defined in requirements.txt
pip install -r requirements.txt

export SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/civictruth"

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive docs are served at `http://localhost:8000/docs` (Swagger),
`/redoc` (ReDoc), and `/openapi.json`.

> **Note:** On first startup the app creates all tables, runs idempotent legacy
> column migrations, and seeds default settings. The HuggingFace models are
> downloaded lazily on the first AI call (needs network access; can be slow).

### Docker

The backend ships a multi-stage `Dockerfile` (CPU-only PyTorch, non-root user,
healthcheck):

```bash
cd backend
docker build -t civictruth-backend:latest .

docker run --rm -p 8000:8000 \
  -e SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')" \
  -e DATABASE_URL="postgresql+asyncpg://postgres:postgres@host.docker.internal:5432/civictruth" \
  -e ALLOWED_HOSTS="*" \
  civictruth-backend:latest
```

The image runs `uvicorn app.main:app --host 0.0.0.0 --port 8000 --proxy-headers
--forwarded-allow-ips=*` (so `X-Forwarded-For` is honored) and has a
`HEALTHCHECK` against `/health`.

### Application Lifecycle

`app/main.py` defines the ASGI `lifespan` context manager. On startup it:

1. **Creates tables** — `Base.metadata.create_all` for every registered model.
2. **Runs legacy migrations** (`_run_legacy_migrations`) — idempotently adds columns
   that may be missing on older databases. PostgreSQL uses
   `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`; SQLite statements are individually
   guarded so a pre-existing column doesn't abort the batch. Covered columns
   include `participants.email`, `blocks.image_url`, `blocks.image_features`,
   `verification_records.input_image_url`, and the `notifications` columns
   (`title`, `message`, `created_by`, `participant_id`, `is_read`, `created_at`).
3. **Seeds default settings** (`_seed_default_settings`) — inserts any missing rows
   (existing keys are left untouched):

   | Key                    | Default value           | Type   | Description                |
   | ---------------------- | ----------------------- | ------ | -------------------------- |
   | `enable.notifications` | `true`                  | bool   | Show in-app notifications  |
   | `support.email`        | `support@civictruth.io` | string | Support email address      |
   | `app.theme`            | `light`                 | string | Application theme          |
   | `session.timeout`      | `30`                    | int    | Session timeout (minutes)  |
   | `api.rate.limit`       | `100`                   | int    | API rate limit per minute  |
   | `site.name`            | `CivicTruth`            | string | Site name                  |

Top-level endpoints outside the versioned prefix:

- `GET /` → `{"message": "CivicTruth Immutable Blockchain API"}`
- `GET /health` → `{"status": "ok"}`

### Middleware & Security Headers

Middleware lives in `app/main.py` and `app/middleware.py`. The stack (outermost
first) is:

1. **TrustedHostMiddleware** — applied only when `ALLOWED_HOSTS` is non-empty and
   does **not** contain `*`. Mitigates host-header injection / DNS rebinding.
2. **SecurityHeadersMiddleware** — injects headers on every response:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - `Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; font-src 'self' https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' https:; connect-src 'self'`
3. **CORSMiddleware** — origins from `CORS_ORIGINS`, credentials enabled, methods
   `GET/POST/PUT/DELETE/OPTIONS`, headers `Authorization`, `Content-Type`.
4. **RateLimitMiddleware** — in-memory sliding-window limiter.

**Rate limiting** (`RateLimitMiddleware`):

- Per client IP, sliding window of `window_seconds` (60), limit
  `RATE_LIMIT_PER_MINUTE`.
- Exempt paths: `/`, `/health`, `/api/v1/auth/login`, `/api/v1/auth/register`.
- The client IP is resolved by `get_client_ip()`, which trusts the **first**
  (left-most) `X-Forwarded-For` value when present, else falls back to the direct
  peer address. Deploy behind a single trusted proxy.
- Stale windows are pruned periodically to bound memory.
- Exceeded limit → `429 {"detail": "Rate limit exceeded"}`.

In `production` (`ENV=production`) unhandled exceptions return a generic
`500 {"detail": "Internal server error"}`; in other environments the exception
string is returned to aid debugging.

### Authentication & Authorization

**Authentication** is stateless JWT bearer auth (`app/deps.py`, `app/utils/security.py`):

- **Passwords** — bcrypt with a per-hash salt. Inputs longer than bcrypt's 72-byte
  limit are truncated before hashing / verifying (invalid stored hashes yield `False`).
- **National ID** — never stored; hashed via `hash_identifier()` =
  `HMAC-SHA256(SECRET_KEY, national_id)` → 64-char hex digest. Duplicate detection
  and login lookups use this digest.
- **Tokens** — `create_access_token()` signs an HS256 JWT with claims `sub`
  (participant UUID), `role`, `full_name`, `national_id_hash`, `exp`, `iat`, and
  `iss="civictruth"`. `decode_access_token()` verifies signature, algorithm, and
  issuer, returning `None` on any `InvalidTokenError`.
- **Lifetime** — defaults to `ACCESS_TOKEN_EXPIRE_MINUTES`, but tokens issued at
  login/register use the `session.timeout` setting (minutes) when present.

**Authorization** is enforced through FastAPI dependencies:

- `get_current_user` — reads `Authorization: Bearer <token>`, decodes the JWT,
  loads the `Participant`, and rejects missing/invalid tokens or inactive users
  with `401`.
- `require_role(*allowed_roles)` — dependency factory returning a checker that
  raises `403 {"detail": "Insufficient permissions"}` when the user's role is not
  allowlisted.

**Roles**: `participant` (default) and `admin`. There is **no public admin
sign-up** — `POST /auth/register` always creates `participant` accounts. Bootstrap
the first admin by updating the row directly:

```sql
UPDATE participants SET role = 'admin' WHERE id = '<participant-uuid>';
```

### Data Model

Tables are defined as SQLAlchemy 2.0 declarative models in `app/models/`. All
primary keys are `String(36)` UUIDs generated in Python (`default=str(uuid.uuid4())`),
and all timestamps are stored as **naive UTC** via `utcnow_naive()` (see
[Utility Helpers](#utility-helpers)).

#### `participants`

| Column            | Type         | Constraints / notes                             |
| ----------------- | ------------ | ----------------------------------------------- |
| `id`              | String(36)   | PK, UUID                                         |
| `full_name`       | String       | not null, indexed                               |
| `national_id_hash`| String       | not null, **unique**, indexed (HMAC-SHA256 hex) |
| `dob`             | DateTime     | nullable                                        |
| `bio`             | String       | nullable                                        |
| `email`           | String       | nullable, indexed                               |
| `password_hash`   | String       | not null (bcrypt)                               |
| `role`            | String       | not null, default `participant`, indexed        |
| `is_active`       | Boolean      | default `True`                                  |
| `created_at`      | DateTime     | default `utcnow_naive`                          |
| `updated_at`      | DateTime     | default `utcnow_naive`, updated on write        |

Relationship: `blocks` (one-to-many to `Block`, `cascade="all, delete-orphan"`).

#### `blocks`

| Column                  | Type       | Constraints / notes                          |
| ----------------------- | ---------- | -------------------------------------------- |
| `id`                    | String(36) | PK, UUID                                      |
| `participant_id`        | String(36) | FK → `participants.id`, not null             |
| `transaction_type`      | String     | not null                                     |
| `transaction_data`      | Text       | not null (may be empty string for image-only)|
| `data_hash`             | String     | not null, indexed                            |
| `parent_hash`           | String     | nullable (previous block hash; genesis = 64×`0`) |
| `block_hash`            | String     | not null, **unique**, indexed                |
| `ai_verification_score` | String     | nullable (4-decimal string)                  |
| `ai_verification_label` | String     | nullable                                     |
| `image_url`             | String     | nullable                                     |
| `image_features`        | Text       | nullable (JSON-encoded float vector)         |
| `created_at`            | DateTime   | default `utcnow_naive`                        |

Relationship: `participant` (many-to-one back to `Participant`).

#### `verification_records`

| Column             | Type       | Constraints / notes                     |
| ------------------ | ---------- | --------------------------------------- |
| `id`               | String(36) | PK, UUID                                 |
| `participant_id`   | String(36) | FK → `participants.id`, nullable        |
| `block_id`         | String(36) | FK → `blocks.id`, nullable              |
| `input_text`       | Text       | nullable                                 |
| `input_image_url`  | String     | nullable                                 |
| `ai_model_id`      | String     | not null (`local` or `dinov2-small`)    |
| `prediction_label` | String     | nullable                                 |
| `prediction_score` | Float      | nullable                                 |
| `verified_by`      | String     | nullable                                 |
| `status`           | String     | default `pending`                        |
| `created_at`       | DateTime   | default `utcnow_naive`                   |

#### `settings`

| Column        | Type       | Constraints / notes               |
| ------------- | ---------- | --------------------------------- |
| `id`          | String(36) | PK, UUID                          |
| `key`         | String(128)| not null, **unique**, indexed     |
| `value`       | Text       | nullable                          |
| `value_type`  | String(32) | not null, default `string`        |
| `description` | Text       | nullable                          |
| `created_at`  | DateTime   | default `utcnow_naive`            |
| `updated_at`  | DateTime   | default `utcnow_naive`, on update |

#### `notifications`

| Column           | Type       | Constraints / notes                        |
| ---------------- | ---------- | ------------------------------------------ |
| `id`             | String(36) | PK, UUID                                   |
| `title`          | String(256)| not null                                    |
| `message`        | Text       | not null                                    |
| `created_by`     | String(36) | FK → `participants.id`, not null            |
| `participant_id` | String(36) | FK → `participants.id`, nullable (target)   |
| `is_read`        | Boolean    | default `False`                             |
| `created_at`     | DateTime   | default `utcnow_naive`                      |

Relationships: `creator` (via `created_by`), `participant` (via `participant_id`).

### Utility Helpers

- **`app/utils/time.py`**
  - `utcnow_naive()` — current UTC as a **naive** datetime (asyncpg cannot store
    tz-aware values in `TIMESTAMP WITHOUT TIME ZONE`; replaces deprecated `datetime.utcnow()`).
  - `parse_iso_date(value)` — parses an ISO-8601 date/datetime string, normalizing
    any timezone to naive UTC; raises `ValueError` on invalid/empty input so callers
    can return `400` instead of `500`.
- **`app/utils/security.py`** — `hash_password`, `verify_password`,
  `hash_identifier`, `create_access_token`, `decode_access_token` (see
  [Authentication & Authorization](#authentication--authorization)).

### API Reference

All resource endpoints are mounted under the prefix **`/api/v1`**. Except for
`/auth/register` and `/auth/login`, every endpoint requires a valid
`Authorization: Bearer <JWT>` header. Errors use FastAPI's standard shape:
`{"detail": "<message>"}`.

Status codes: `200` OK · `400` bad request · `401` unauthenticated · `403`
forbidden (role/ownership) · `404` not found · `422` validation error · `429`
rate limited.

#### Auth — `/api/v1/auth`

| Method | Path        | Auth   | Description |
| ------ | ----------- | ------ | ----------- |
| POST   | `/register` | public | Create a `participant`. Body: `national_id`, `full_name` (1–256), `password` (8–128), optional `dob`, `bio`, `email`. Returns `{access_token, token_type, role, participant}`. `400` if the national ID is already registered or `dob` is invalid. The raw `national_id` is never echoed back — only `national_id_mask`. |
| POST   | `/login`    | public | Body: `national_id`, `password`. Returns `{access_token, token_type, role, participant}`. `401 Invalid credentials` on bad user/password. |
| GET    | `/me`       | bearer | Returns the current `ParticipantResponse`. |
| PUT    | `/me`       | bearer | Update own profile (`full_name`, `dob`, `bio`, `email`). An empty `dob` clears it. Returns updated `ParticipantResponse`. |

#### Blockchain — `/api/v1/blockchain`

| Method | Path            | Auth          | Description |
| ------ | --------------- | ------------- | ----------- |
| POST   | `/`             | bearer        | Append a block. Body: `participant_id`, `transaction_type` (1–64), and **either** `transaction_data` (≤65535) **or** `image_url` (at least one required → otherwise `422`). Participants may only author blocks for themselves; admins any participant. Computes hashes, AI text verification, and (for images) DINOv2 features. Returns `BlockResponse`. `403` for another participant, `404` if participant missing. |
| GET    | `/`             | bearer        | List blocks. Admins see all; participants see only their own. Ordered newest-first. |
| GET    | `/chain/verify` | bearer        | Verify the whole chain. Returns `{valid, blocks_checked, broken_at, details[]}`. |
| GET    | `/{entry_id}`   | bearer        | Fetch one block. `403` if it belongs to another participant, `404` if missing. |
| PUT    | `/{entry_id}`   | **admin**     | Update a block's `transaction_type`, `transaction_data`, and/or `image_url`. Recomputes this block's hashes and re-hashes **all subsequent blocks**. Returns the updated `BlockResponse`. |
| DELETE | `/{entry_id}`   | bearer        | Delete a block. Allowed for its owner or an admin. Re-links subsequent blocks to the deleted block's parent. Returns `{message, id}`. |

#### Verification — `/api/v1/verify`

| Method | Path | Auth   | Description |
| ------ | ---- | ------ | ----------- |
| POST   | `/`  | bearer | Verify submitted text or image against the ledger. Body: optional `participant_id`, optional `block_id`, and **either** `input_text` **or** `image_url` (at least one required → else `422`). Participants are scoped to their own blocks (an explicit mismatching `participant_id` → `403`). Returns a `VerificationResponse` including `prediction_label`, `prediction_score`, `matched_blocks[]`, `result_text` (human-readable), and `is_exact_match`. A `VerificationRecord` is persisted. `404` if no matching blocks exist, `400` if image features can't be extracted. |

#### Participants — `/api/v1/participants`

| Method | Path                | Auth      | Description |
| ------ | ------------------- | --------- | ----------- |
| GET    | `/`                 | bearer    | Paginated list. Query: `limit` (1–100, default 10), `offset` (≥0). Returns `ParticipantResponse[]`. |
| GET    | `/{participant_id}` | bearer    | Fetch one participant (`404` if missing). |
| POST   | `/`                 | **admin** | Create a participant. Body: `full_name`, `national_id`, `password` (8–128), optional `email`, `dob`, `bio`. `400` on duplicate national ID. |
| PUT    | `/{participant_id}` | **admin** | Update `full_name`, `dob`, `bio`, `email`, `is_active`. |
| DELETE | `/{participant_id}` | **admin** | Delete a participant. `400` if attempting to delete your own account. |

#### Settings — `/api/v1/settings`

| Method | Path            | Auth      | Description |
| ------ | --------------- | --------- | ----------- |
| GET    | `/`             | bearer    | List settings. Query: `limit` (1–500, default 100), `offset` (≥0). |
| GET    | `/{setting_id}` | bearer    | Fetch one setting (`404` if missing). |
| PUT    | `/{setting_id}` | **admin** | Update `value` / `value_type` / `description`. |

#### Notifications — `/api/v1/notifications`

| Method | Path                      | Auth      | Description |
| ------ | ------------------------- | --------- | ----------- |
| POST   | `/`                       | **admin** | Broadcast a notification. Body: `title` (1–256), `message`. Sets `created_by` to the admin. |
| GET    | `/`                       | bearer    | List notifications visible to the caller: broadcasts (`participant_id IS NULL`) plus any addressed to them, newest-first. |
| PATCH  | `/{notification_id}/read` | bearer    | Mark read/unread. Body: `{is_read}`. `403` if the notification is addressed to someone else. |
| PUT    | `/{notification_id}`      | **admin** | Update `title` / `message`. |
| DELETE | `/{notification_id}`      | **admin** | Delete a notification. Returns `{message, id}`. |

#### Response shapes (selected)

**`BlockResponse`**

```json
{
  "id": "uuid",
  "participant_id": "uuid",
  "participant_name": "Ada Lovelace",
  "transaction_type": "birth_certificate",
  "transaction_data": "…",
  "data_hash": "…64-hex…",
  "block_hash": "…64-hex…",
  "ai_verification_score": "0.9123",
  "ai_verification_label": "Factual",
  "image_url": null,
  "image_features": null,
  "created_at": "2026-01-01T12:00:00"
}
```

**`VerificationResponse`**

```json
{
  "id": "uuid",
  "participant_id": "uuid",
  "block_id": null,
  "input_text": "submitted content",
  "input_image_url": null,
  "ai_model_id": "local",
  "prediction_label": "Exact Match",
  "prediction_score": 0.99,
  "status": "completed",
  "matched_blocks": [ { "id": "…", "transaction_type": "…", "block_hash": "…" } ],
  "result_text": "The submitted document has been verified …",
  "created_at": "2026-01-01T12:00:00"
}
```

### Tamper-Proof Hash Chain

Implemented in `app/services/tamper_proof.py`. The chain is a single global,
chronologically-ordered list of blocks; integrity comes from linking each block's
hash to its predecessor.

- **Genesis hash** — `GENESIS_HASH = "0" * 64`, the `parent_hash` of the first block.
- **`compute_data_hash(transaction_data, image_url=None)`** — SHA-256 of the data,
  with `\n[image:<url>]` appended when an image URL is present.
- **`compute_block_hash(data_hash, parent_hash, timestamp)`** — SHA-256 of
  `"{data_hash}:{parent_hash}:{timestamp.isoformat()}"`.
- **`append_to_chain(block, db=None)`** — under an `asyncio.Lock` (`chain_lock`),
  stamps `created_at`, sets `parent_hash` to the latest block's hash (or genesis),
  computes `data_hash` and `block_hash`, and flushes. Ordering uses
  `created_at DESC, id DESC` to find the latest block.
- **`verify_chain()`** — walks blocks in ascending order, recomputing each
  `data_hash` and confirming each `parent_hash` equals the previous `block_hash`.
  Returns `{valid, blocks_checked, broken_at, details[]}`; on failure it stops at
  the first broken block and reports its id.

**Mutation safety:** editing (`PUT`) or deleting a block recomputes the affected
block's hashes and then re-hashes every subsequent block so the chain remains
valid — this is exercised by tests such as `test_admin_update_block_rehashes_downstream`
and `test_delete_block_by_owner_keeps_chain_valid`. A raw DB edit that breaks a
stored hash is detected by `verify_chain` (`test_chain_verify_detects_tampering`).

### AI Verification Services

All inference runs **locally** with HuggingFace models — no external AI services.

**Text — `app/services/ai_verification.py`**

- Loads `AutoTokenizer` + `AutoModel` lazily (double-checked `asyncio.Lock`,
  executed in a thread) and mean-pools + L2-normalizes embeddings.
- Two modes:
  - **Reference mode** — `verify_text_locally(text, reference_text=...)` computes
    cosine similarity to the reference and maps it to a label using thresholds:
    `> 0.85 → Exact Match`, `> 0.65 → Partial Match`, `> 0.40 → Mismatch`,
    else `Unrelated`; if the score is below `threshold` (default `0.60`) the label
    becomes `Uncertain`.
  - **Label mode** — without a reference, the text embedding is compared to
    `ARCHIVE_LABELS` (`Factual`, `Opinion`, `Misleading`, `Plausible`, `Irrelevant`)
    and the nearest label wins (sub-threshold → `Uncertain`).
- `VERIFICATION_LABELS` (`Exact Match`, `Mismatch`, `Partial Match`, `Unrelated`,
  `Fabricated`) are also defined for reference.

**Images — `app/services/image_features.py`**

- Loads `AutoImageProcessor` + `AutoModel` for DINOv2 (`DINOV2_MODEL_ID`), moving
  the model to `HF_DEVICE` and evaluating.
- `extract_image_features(image_url)` streams the remote image via `httpx` with a
  **10 MB cap** (`_MAX_IMAGE_BYTES`) to mitigate decompression-bomb / SSRF abuse,
  converts to RGB, and returns a mean-pooled, L2-normalized embedding list.
  Any failure is logged and returns `None`.

**Router integration**

- `blockchain.py` stores `ai_verification_label` + a 4-decimal `ai_verification_score`
  for text blocks and JSON-encoded `image_features` for image blocks.
- `verification.py` scores cosine similarity (via `torch`) between the submitted
  embedding and candidate block embeddings, applies the same label thresholds, and
  composes a human-readable `result_text` describing the outcome.

### Backend Testing

The suite lives in `backend/tests/` and drives the **real ASGI app** (routers,
middleware, lifespan, async SQLAlchemy) through FastAPI's `TestClient` — i.e.
true end-to-end HTTP tests. Key design points (see `conftest.py`):

- The environment is configured **before** importing `app`, pointing
  `DATABASE_URL` at a throwaway **SQLite** file (`sqlite+aiosqlite:///…`) so no
  real PostgreSQL is required.
- The heavy AI stack is monkeypatched with deterministic fakes, keeping tests fast
  and offline.
- Tables are wiped between tests via a plain `sqlite3` connection (seeded settings
  are preserved). A first admin is bootstrapped by directly updating the DB row.

Run the suite:

```bash
cd backend
pytest                       # whole suite
pytest tests/test_blockchain.py -v
pytest -k "verify" -v
```

Test modules: `test_auth.py`, `test_blockchain.py`, `test_health.py`,
`test_verification.py`, `test_participants.py`, `test_settings.py`,
`test_notifications.py`, `test_middleware.py`, `test_utils.py`.

---

## Frontend

A React 19 single-page application built with Vite, styled with Tailwind CSS, and
communicating with the backend exclusively through a versioned Axios client. It
implements JWT auth, role-gated routes, light/dark theming, toast notifications,
confirmation dialogs, and an error boundary.

### Frontend Configuration & Environment Variables

Vite exposes environment variables prefixed with `VITE_` on `import.meta.env`.
Create `frontend/.env` (or `.env.local`) as needed:

| Variable                | Default       | Used by | Purpose |
| ----------------------- | ------------- | ------- | ------- |
| `VITE_API_URL`          | `/api/v1`     | `src/services/api.js` | Axios `baseURL`. Defaults to the dev-proxy path. |
| `VITE_DEV_PROXY_TARGET` | `http://localhost:8000` | `vite.config.js` | Backend target for the dev proxy of `/api`. |

The dev server proxies `/api` to the backend (see `vite.config.js`), so during
development the SPA and API can share an origin and avoid CORS entirely.

### Running the Frontend

Prerequisites: **Node.js 18+** (Node 20+ recommended for Vite 8) and npm.

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

The dev server listens on `http://localhost:5173` (matching the backend's default
`CORS_ORIGINS`).

### Build & Preview

```bash
cd frontend
npm run build          # production bundle → dist/ (target es2018, no sourcemaps)
npm run preview        # serve the built bundle locally
npm run lint           # ESLint (flat config)
```

### Routing & Access Control

Routes are declared in `src/App.jsx` with React Router (`BrowserRouter`). The
authenticated area is wrapped in a shared `<Layout>` (header + sidebar) and
defended by `<ProtectedRoute>`.

| Path                          | Screen            | Roles                 |
| ----------------------------- | ----------------- | --------------------- |
| `/login`                      | `Login`           | public                |
| `/register`                   | `Register`        | public                |
| `/`                           | `Home`            | admin, participant    |
| `/blockchain`                 | `Blockchain`      | admin, participant    |
| `/verify`                     | `Verify`          | admin, participant    |
| `/notifications`              | `Notifications`   | admin, participant    |
| `/profile`                    | `Profile`         | admin, participant    |
| `/dashboard`                  | `Dashboard`       | **admin**             |
| `/participants`               | `Participants`    | **admin**             |
| `/participants/:participantId`| `ParticipantDetail` | **admin**           |
| `/settings`                   | `Settings`        | **admin**             |

Unknown paths redirect to `/`.

**`ProtectedRoute`** (`src/components/ProtectedRoute.jsx`) performs client-side
gating only:

1. No / malformed token → clear token and redirect to `/login`.
2. Expired token (`exp`) → clear token and redirect to `/login`.
3. If `allowedRoles` is provided and the token role isn't included → redirect to `/`.

> Authorization is always re-enforced server-side; the client gate is purely for
> UX and never the security boundary.

On logout, the app clears the token and does a full `window.location.assign('/login')`
to reset in-memory SPA state.

### State, Context & Theming

Provider nesting (outermost → innermost) in `App.jsx`:
`SettingsProvider` → `ThemeModeContext.Provider` → `ErrorBoundary` →
`ConfirmDialogProvider` → `ToastProvider` → `Router`.

- **`SettingsContext`** (`shared/SettingsContext.jsx`) — fetches `/settings/` once
  and exposes a `key → value` map plus `loading`, `error`, and `refresh()`.
- **`ThemeModeContext`** (`shared/ThemeModeContext.jsx`) — exposes `mode`
  (`light`/`dark`) and `toggleMode()`. The initial mode is read from
  `localStorage.theme` or the OS `prefers-color-scheme`; the `app.theme` backend
  setting overrides it. The active theme is applied via
  `document.documentElement[data-theme]`, which drives Tailwind's
  `darkMode: ['selector', '[data-theme="dark"]']` strategy.
- **`Toast`** (`shared/Toast.jsx`) — context with `toast/success/error/warning/info`.
  Auto-hides (4s default; 5s warning, 6s error) and honors the
  `enable.notifications` setting (except for errors). Rendered with
  `role="status" aria-live="polite"`.
- **`ConfirmDialog`** (`shared/ConfirmDialog.jsx`) — promise-based `confirm()`
  dialog with focus management, `Escape`-to-cancel, and focus restoration. Also
  exports a `ConfirmButton` helper.
- **`ErrorBoundary`** (`shared/ErrorBoundary.jsx`) — class component catching render
  errors, showing a friendly fallback and a reload button; raw error detail is shown
  only in dev (`import.meta.env.DEV`).

### API Client

`src/services/api.js` creates a single Axios instance and groups endpoints by
resource. The token is read from `localStorage` (`access_token`) and attached as a
`Bearer` header on every request by a request interceptor.

- `baseURL`: `import.meta.env.VITE_API_URL || "/api/v1"`, 30s timeout,
  JSON content type.
- **Response interceptor:** a `401` clears the token and redirects to
  `/login?redirect=<intended-path>`, **except** for `/auth/login` and
  `/auth/register` (so a failed sign-in doesn't trigger a redirect loop).

Exported API groups:

| Group             | Methods |
| ----------------- | ------- |
| `authAPI`         | `register`, `login`, `getMe`, `updateMe` |
| `participantsAPI` | `list(params)`, `get(id)`, `create(data)`, `update(id, data)`, `remove(id)` |
| `blockchainAPI`   | `create`, `list`, `verifyChain`, `get(id)`, `update(id, data)`, `remove(id)` |
| `settingsAPI`     | `list(params)`, `get(id)`, `update(id, data)` |
| `notificationsAPI`| `list`, `create`, `update`, `remove`, `markRead(id, isRead)` |
| `verifyAPI`       | `run(data)` |

**Token helpers — `src/utils/auth.js`:** `decodeToken` (base64url JWT payload
decode, no signature check), `getToken`/`setToken`/`clearAuthToken`
(localStorage `access_token`), `getRoleFromToken`, `getUserIdFromToken`,
`getUserInfoFromToken`, `isTokenExpired`. These are for **display/UX only** — the
backend re-validates every request.

### Component Catalog

**Layout & routing**

- **`Layout`** (`components/Layout.jsx`) — collapsible desktop sidebar (240px /
  72px) with a mobile drawer, a top app bar, a notification bell, a profile menu,
  and a theme toggle. Renders the child route via `<Outlet/>`. Nav items are
  filtered by role (see the `navItems` table).

  | Nav item      | Path             | Roles              |
  | ------------- | ---------------- | ------------------ |
  | Home          | `/`              | admin, participant |
  | Blockchain    | `/blockchain`    | admin, participant |
  | Verify        | `/verify`        | admin, participant |
  | Notifications | `/notifications` | admin, participant |
  | Dashboard     | `/dashboard`     | admin              |
  | Participants  | `/participants`  | admin              |
  | Settings      | `/settings`      | admin              |
  | Profile       | `/profile`       | admin, participant |

**Shared primitives (`components/shared/`)**

| Component            | Purpose |
| -------------------- | ------- |
| `PageContainer`      | Responsive max-width padded wrapper (`sm`/`md`/`lg`/`xl`/`full`). |
| `PageHeader`         | Page title, subtitle, breadcrumbs, and a right-aligned action slot. |
| `Dropdown`           | Accessible custom select (click-outside + `Escape` to close). |
| `EmptyState`         | Placeholder card with icon, title, description, and optional action link. |
| `StatusBadge`        | Status pill that maps keyword → color (success/error/warning/info/default). |
| `ScoreBar`           | Percentage bar with threshold-based coloring. |
| `LoadingOverlay`     | Spinner overlay wrapper. |
| `Skeletons`          | `SkeletonCard`, `SkeletonTable`, `SkeletonStatCards`, `SkeletonForm`, `SkeletonAvatar` loading placeholders. |

**Screens (`pages/`)**

| Page                | Highlights |
| ------------------- | ---------- |
| `Home`              | Role-filtered feature grid driven by the `site.name` setting. |
| `Login`             | Id/password form with show-password toggle, validation, redirect support. |
| `Register`          | Multi-step (name → national ID → credentials) wizard with validation. |
| `Blockchain`        | Browse/create/update/delete blocks, per-block AI labels, and "verify chain" action. |
| `Verify`            | Submit text or an image URL; renders match label, confidence, and matched blocks. |
| `Dashboard`         | Admin stats + chain-integrity card + recent activity. |
| `Participants`      | Admin participant registry (list, create, edit, delete). |
| `ParticipantDetail` | Admin per-participant view with their blocks and chain status. |
| `Notifications`     | List/read/manage notifications (admin broadcast controls). |
| `Profile`           | View/edit own profile; admins can edit other participants. |
| `Settings`          | Admin editor for application settings (theme, session timeout, etc.). |

**Styling (`src/index.css`, `tailwind.config.js`)**

- Tailwind base/components/utilities layers plus custom design tokens (CSS
  variables for body background, focus rings, theme transitions).
- `darkMode: ['selector', '[data-theme="dark"]']`.
- Custom brand palettes (`primary`, `success`, `warning`, `error`, `info`,
  `grey`), Inter font, custom radii/shadows, and animations
  (`fade-in`, `slide-in-up`, `float`, `gradient-shift`, `spin`, `shimmer`).
- Reusable classes: `btn-primary`, `btn-secondary`, `btn-danger`, `glass-effect`,
  `gradient-primary`, `gradient-text`, `page-transition-*`, `skip-to-content`,
  `responsive-*` helpers, and `prefers-reduced-motion` handling.

Accessibility touches: a "Skip to main content" link, ARIA roles/labels on dialogs,
nav, toasts, and skeleton loaders, visible focus rings, and reduced-motion support.

---

## Local Development Workflow

Two terminals, from the repository root (`v1/`):

**Terminal 1 — backend**

```bash
cd backend
source .venv/bin/activate
export SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
export DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/civictruth"
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173, proxies /api → :8000
```

Then open `http://localhost:5173`, register an account, and (to test admin
features) promote it:

```sql
UPDATE participants SET role = 'admin' WHERE id = '<participant-uuid>';
```

---

## Security Notes

- **Secrets** — `SECRET_KEY` (≥32 bytes) signs JWTs and keys national-ID HMACs.
  Never commit real secrets; `.env` files are environment-specific.
- **Identity privacy** — the raw national ID is never persisted or returned; only
  its HMAC digest and a masked display form are used.
- **Passwords** — bcrypt with per-hash salt; inputs are truncated to bcrypt's
  72-byte limit.
- **Transport & headers** — `TrustedHostMiddleware` (when `ALLOWED_HOSTS` excludes
  `*`), strict security headers (HSTS, CSP, `X-Frame-Options: DENY`, `nosniff`),
  and an origin-allowlisted CORS policy.
- **Abuse controls** — per-IP sliding-window rate limiting with auth endpoints
  exempt; remote image downloads are size-capped (10 MB) to limit SSRF /
  decompression-bomb exposure.
- **Authorization** — enforced server-side via `get_current_user` and
  `require_role(...)`; the frontend gate is UX-only.
- **Error disclosure** — production returns generic `500` bodies; detailed
  exception strings are limited to non-production environments.
- **Deployment** — run behind a single trusted reverse proxy that sets
  `X-Forwarded-For`, and set `ENV=production` with a restrictive `ALLOWED_HOSTS`
  and `CORS_ORIGINS`.

---

*CivicTruth — immutable, verifiable civic records with local AI assurance.*


