# BNTO

A consumer banking portal for bank account holders, built as a UMKC Computer Science capstone.

- **Backend:** Java 21 / Spring Boot 4, PostgreSQL, JWT authentication, Ollama for AI budgeting tips
- **Frontend:** React + TypeScript (Vite), deployed on Vercel

**Live API:** `https://bnto-backend.northcentralus.cloudapp.azure.com`
(check it with [`/api/health`](https://bnto-backend.northcentralus.cloudapp.azure.com/api/health))

## Contents

- [For frontend developers](#for-frontend-developers): the short version
- [Run the backend locally](#run-the-backend-locally)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Calling the API from the frontend](#calling-the-api-from-the-frontend)
- [Testing](#testing)
- [Database access](#database-access)
- [Troubleshooting](#troubleshooting)
- [Deployment (Azure VM)](#deployment-azure-vm)
- [Secrets](#secrets)
- [Project structure](#project-structure)
- [Known limitations](#known-limitations)

---

## For frontend developers

You don't need to run the backend to build against it. Point the frontend at the live API:

```bash
# frontend/.env.local
VITE_API_URL=https://bnto-backend.northcentralus.cloudapp.azure.com
```

No trailing slash. Restart `npm run dev` after changing it.

The backend accepts browser requests from two origins:

| Origin | What it is |
|---|---|
| `https://frontend-ten-chi-hxiv0m6g7l.vercel.app` | Deployed frontend |
| `http://localhost:8443` | Local Vite dev server (`npm run dev`) |

If you run the frontend anywhere else, the browser will block it with a CORS error. See [Configuration](#configuration).

The endpoints you'll use most:

| What | Call |
|---|---|
| Sign up | `POST /api/auth/register` |
| Log in (get a token) | `POST /api/auth/login` |
| Anything protected | add header `Authorization: Bearer <token>` |

Full details: [API reference](#api-reference) and [Calling the API from the frontend](#calling-the-api-from-the-frontend).

---

## Run the backend locally

### Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **JDK** | 21 or newer | `java -version` |
| **Docker Desktop** | current | Must be **running** before any `docker compose` command |
| **Git** | any | |
| **Ollama** | current | Optional. Only needed for the AI endpoints (see [Ollama](#ollama-optional)) |

Maven isn't needed: the repo includes the Maven wrapper (`mvnw` / `mvnw.cmd`).

### 1. Create the root `.env` file

From the repo root (`BNTO-Capstone/`):

```bash
cp .env.example .env            # PowerShell: Copy-Item .env.example .env
```

`docker compose` reads this file to set up the local database. The default values are fine as they are.

### 2. Start the database

Start Docker Desktop and wait until it's ready. Then, from the **repo root**:

```bash
docker compose up -d
docker compose ps
```

You want `STATUS` = `Up` and `PORTS` showing `0.0.0.0:5433->5432/tcp`. The first run pulls the `postgres:16` image and takes 30 to 60 seconds.

### 3. Set a JWT secret

The backend signs login tokens with `JWT_SECRET`, a base64 string of at least 32 random bytes. **It won't start without one.** The backend doesn't read `.env`, so set it in the terminal you'll start the backend from.

PowerShell:

```powershell
$b = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b)
$env:JWT_SECRET = [Convert]::ToBase64String($b)
```

macOS / Linux / Git Bash:

```bash
export JWT_SECRET="$(openssl rand -base64 32)"
```

Any random value works locally. A new value only means earlier tokens stop working. The variable lasts for that terminal session, so set it again in each new terminal, or save it permanently. In PowerShell: `[Environment]::SetEnvironmentVariable("JWT_SECRET", $env:JWT_SECRET, "User")`, then open a new terminal.

### 4. Start the backend

From the **`backend/`** directory, in the same terminal:

```bash
./mvnw spring-boot:run          # PowerShell: .\mvnw.cmd spring-boot:run
```

Wait for these lines near the end of the log:

```
Tomcat started on port 8080 (http)
Started BackendApplication in X.XXX seconds
```

The backend connects to the database while starting up, so seeing those lines means everything is connected.

### 5. Check it

```powershell
Invoke-RestMethod http://localhost:8080/api/health      # prints: True
```

```bash
curl http://localhost:8080/api/health                    # prints: true
```

The API is now at `http://localhost:8080`. To point a local frontend at it, set `VITE_API_URL=http://localhost:8080` in `frontend/.env.local`.

### 6. Stopping

- Backend: `Ctrl+C` in its terminal.
- Database: `docker compose down` from the repo root. **Don't add `-v`**: that deletes the database volume and all local data.

### Ollama (optional)

Only `GET /api/ai/test`, and `POST /api/budget/generate` for users who have accounts, call Ollama. Everything else works without it.

```bash
ollama pull qwen3:1.7b
ollama run qwen3:1.7b      # quick check; Ctrl+D to exit
```

The backend expects Ollama at `http://localhost:11434`.

---

## Configuration

All settings come from environment variables, with defaults in `backend/src/main/resources/application.properties`. Locally, only `JWT_SECRET` needs setting.

| Variable | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | *(none, required)* | Base64 key, at least 32 bytes, for signing login tokens. Must stay the same across restarts, or existing tokens stop working. |
| `POSTGRES_PORT` | `5433` | Database port. Docker maps 5433 on your machine. A native Postgres install normally uses `5432`. |
| `POSTGRES_DB` | `bnto` | Database name |
| `POSTGRES_USER` | `bnto_user` | Database user |
| `POSTGRES_PASSWORD` | `bnto_pass` | Database password |
| `CORS_ALLOWED_ORIGINS` | `https://frontend-ten-chi-hxiv0m6g7l.vercel.app,http://localhost:8443` | Comma-separated list of exact frontend origins that may call the API from a browser. No wildcards. |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server |
| `OLLAMA_MODEL` | `qwen3:1.7b` | Model used for budget tips |

**Adding a frontend origin.** For example, if Vite runs on a different port, set the full list:

```powershell
$env:CORS_ALLOWED_ORIGINS = "https://frontend-ten-chi-hxiv0m6g7l.vercel.app,http://localhost:8443,http://localhost:5173"
```

An origin is the scheme, host and port only, with no path and no trailing slash.

---

## API reference

Base URL: `http://localhost:8080` locally, `https://bnto-backend.northcentralus.cloudapp.azure.com` in production.

### Conventions

- **Request bodies** are JSON. Send `Content-Type: application/json`.
- **Auth:** protected endpoints need `Authorization: Bearer <token>`, using the token from `POST /api/auth/login`.
- **Errors** from the auth endpoints use one JSON shape (see [Error responses](#error-responses)).

### Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | none | Is the backend up? |
| `POST` | `/api/auth/register` | none | Create an account |
| `POST` | `/api/auth/login` | none | Log in; returns a token |
| `POST` | `/api/budget/generate` | **token** | AI budget tips for the logged-in user |
| `GET` | `/api/ai/test` | none | Checks the backend can reach Ollama (dev only) |

Any other path needs a token, and without one returns `401`.

---

### `GET /api/health`

Returns the JSON value `true` with status `200` when the backend is running.

---

### `POST /api/auth/register`

Creates a user. **It doesn't log them in.** Call `POST /api/auth/login` afterwards to get a token.

**Request**

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "dateOfBirth": "1990-05-15",
  "mobileNumber": "(816) 555-0100",
  "homeAddress": "123 Main St, Kansas City, MO",
  "email": "jane@example.com",
  "password": "password1!"
}
```

| Field | Rules | Message when invalid |
|---|---|---|
| `firstName` | required, max 100 characters | `First name is required` / `First name must be 100 characters or fewer` |
| `lastName` | required, max 100 characters | `Last name is required` / `Last name must be 100 characters or fewer` |
| `dateOfBirth` | required, `yyyy-MM-dd`, a real date, not in the future, **18 or older** | `Date of birth must be in yyyy-MM-dd format`, or see the 400 example below |
| `mobileNumber` | required, 7 to 20 characters of digits, spaces, `+ ( ) -` | `Mobile number contains invalid characters` |
| `homeAddress` | required, max 255 characters | `Home address is required` / `Home address must be 255 characters or fewer` |
| `email` | required, valid email, max 255 characters | `Email is required` / `Email must be a valid address` |
| `password` | required, 8 to 72 characters | `Password is required` / `Password must be between 8 and 72 characters` |

**How values are stored:**
- **Names and address** are trimmed.
- **Email** is trimmed and lowercased.
- **Mobile number:** spaces, dashes and parentheses are removed, so `(816) 555-0100` is stored as `8165550100`. A leading `+1` is accepted and stored as `1…`. **Any other country code is rejected.**

**Responses**

| Status | When | Body |
|---|---|---|
| `201 Created` | Success | `{ "id": 1, "email": "jane@example.com" }` |
| `400 Bad Request` | A field breaks a rule above | `ApiError` with `fieldErrors`, one entry per invalid field |
| `400 Bad Request` | Date is impossible, in the future, or under 18 | `ApiError`, e.g. `"message": "You must be at least 18 years old"` |
| `400 Bad Request` | Body missing or not valid JSON | `ApiError`, `"message": "Request body is missing or malformed"` |
| `409 Conflict` | Email or mobile number already registered | `ApiError`, `"message": "Email is already registered"` or `"Mobile number is already registered"` |

The response never includes the password or its hash.

---

### `POST /api/auth/login`

**Request**

```json
{ "email": "jane@example.com", "password": "password1!" }
```

Email is case-insensitive. Both fields are required, and `email` must be a valid address.

**Responses**

| Status | When | Body |
|---|---|---|
| `200 OK` | Success | see below |
| `400 Bad Request` | Missing or invalid field | `ApiError` with `fieldErrors` |
| `401 Unauthorized` | Wrong password **or** no such account | `ApiError`, `"message": "Invalid email or password"` |

The 401 is identical for a wrong password and an unknown email on purpose, so the API can't be used to find out who has an account.

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

- **`token`:** send it as `Authorization: Bearer <token>` on protected requests.
- **`expiresIn`:** seconds until the token expires (1 hour). There is no refresh endpoint. When a protected call returns `401`, send the user back to log in.
- **The token's `sub` claim** is the user's numeric id. Treat the token as opaque; the backend works out who the user is from it.

---

### `POST /api/budget/generate`

**Requires a token.** Returns AI budgeting tips for the **logged-in** user, worked out from their accounts and transactions. No request body or parameters are needed: the user comes from the token.

| Status | Body |
|---|---|
| `200 OK` | **Plain text, not JSON.** `No accounts were found for this user.` if the user has no accounts, otherwise the tips (this calls Ollama) |
| `401 Unauthorized` | Missing, invalid or expired token. **Empty body**, see below |

---

### `GET /api/ai/test`

Development check that the backend can reach Ollama. Returns plain text, normally `BNTO AI connection successful`. Fails with `500` if Ollama isn't running.

---

### Error responses

Errors from the auth endpoints have this shape (`ApiError`):

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "fieldErrors": {
    "email": "Email must be a valid address",
    "password": "Password must be between 8 and 72 characters"
  },
  "timestamp": "2026-11-19T21:16:01.123Z"
}
```

- **`fieldErrors`** is always present. It's `{}` unless the error is about specific fields, and the keys match the request's field names, so you can show each message next to its input.
- **`message`** is safe to show to users.

**Two kinds of error look different:**

| Case | Status | Body |
|---|---|---|
| Missing, invalid or expired token on a protected endpoint | `401` | **Empty**, with a `WWW-Authenticate: Bearer …` header. Don't call `response.json()` on it. |
| Unexpected server error | `500` | Spring's default `{ timestamp, status, error, path }` |

---

## Calling the API from the frontend

```ts
// src/api/auth.ts
const API = import.meta.env.VITE_API_URL;

export type ApiError = {
  status: number;
  error: string;
  message: string;
  fieldErrors: Record<string, string>;
  timestamp: string;
};

export type LoginResponse = { token: string; tokenType: "Bearer"; expiresIn: number };

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw (await res.json()) as ApiError; // auth endpoints always return an ApiError body
  return res.json() as Promise<T>;
}

export const register = (user: {
  firstName: string; lastName: string; dateOfBirth: string; // "yyyy-MM-dd"
  mobileNumber: string; homeAddress: string; email: string; password: string;
}) => postJson<{ id: number; email: string }>("/api/auth/register", user);

export const login = (email: string, password: string) =>
  postJson<LoginResponse>("/api/auth/login", { email, password });
```

```ts
// Calling a protected endpoint
export async function generateBudget(token: string): Promise<string> {
  const res = await fetch(`${API}/api/budget/generate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("SESSION_EXPIRED"); // empty body: send the user to log in
  if (!res.ok) throw new Error(`Budget request failed: ${res.status}`);
  return res.text(); // plain text, not JSON
}
```

Things to get right:
- **Showing errors:** on a `400`, show `fieldErrors[field]` next to each input. For other errors, show `message`.
- **Handling 401s:** a `401` from a protected endpoint has no body. Check `res.status` before parsing.
- **Cookies:** don't use `credentials: "include"`. The token goes in the `Authorization` header, not a cookie.

---

## Testing

From `backend/`:

```bash
./mvnw test                     # PowerShell: .\mvnw.cmd test
```

You don't need Docker, Postgres, `JWT_SECRET` or Ollama. The tests use an in-memory H2 database and a test-only secret from `backend/src/test/resources/application.properties`. A passing run ends with `BUILD SUCCESS`.

Run one class or one test:

```powershell
.\mvnw.cmd test "-Dtest=AuthControllerWebMvcTest"
.\mvnw.cmd test "-Dtest=AuthServiceTest#wrongPasswordThrowsBadCredentials"
```

Keep the quotes in PowerShell.

**Trying the running API by hand** (PowerShell):

```powershell
$api = "http://localhost:8080"
$reg = @{ firstName="Jane"; lastName="Doe"; dateOfBirth="1990-05-15"; mobileNumber="816-555-0100"
          homeAddress="123 Main St"; email="jane@example.com"; password="password1!" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$api/api/auth/register" -ContentType "application/json" -Body $reg

$login = @{ email="jane@example.com"; password="password1!" } | ConvertTo-Json
$res = Invoke-RestMethod -Method Post -Uri "$api/api/auth/login" -ContentType "application/json" -Body $login

Invoke-RestMethod -Method Post -Uri "$api/api/budget/generate" -Headers @{ Authorization = "Bearer $($res.token)" }
```

`Invoke-RestMethod` treats any 4xx response as an error and prints it in red. That's expected when you're testing error cases.

---

## Database access

The local database runs in the `bnto-postgres` container:

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `5433` |
| Database | `bnto` |
| User | `bnto_user` |
| Password | `bnto_pass` |

These are **local development credentials only**, committed on purpose so a fresh clone works. See [Secrets](#secrets).

```bash
docker compose exec postgres psql -U bnto_user -d bnto
```

Useful once you're in: `\dt` lists tables, `\d users` shows a table's columns, `SELECT * FROM users;`, `\q` quits.

Tables are created and updated automatically from the Java entities when the backend starts (`ddl-auto=update`).

---

## Troubleshooting

### The backend won't start

| Log message | Fix |
|---|---|
| `Could not resolve placeholder 'JWT_SECRET'` | `JWT_SECRET` isn't set in this terminal. See [step 3](#3-set-a-jwt-secret). |
| `JWT_SECRET must contain at least 32 bytes`, or `Illegal base64 character` | The value isn't base64 of 32+ bytes. Generate a new one with the commands in step 3. |
| `Connection to localhost:5433 refused` | The database isn't running (`docker compose ps`), or Postgres is on another port. Set `POSTGRES_PORT`. |
| `password authentication failed for user ...` | See below |
| `Port 8080 is already in use` | Stop the other process, or run on another port: `./mvnw spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"` |

A variable saved permanently (for example with `SetEnvironmentVariable`) only reaches terminals opened **after** it was saved. Open a new terminal.

### "Port 5433 is already allocated" (docker compose)

Something else is using the port. Either stop it, or change the left-hand number in `docker-compose.yml` (`"5433:5432"`) and set `POSTGRES_PORT` to match.

### "password authentication failed for user ..."

Postgres gives this same message whether the password is wrong **or the user doesn't exist at all**. Connect from inside the container, where the real error is shown:

```bash
docker compose exec postgres psql -U bnto_user -d bnto -c "\du"
```

- **It connects fine:** the database is healthy, and the backend's `POSTGRES_*` values are wrong.
- **"role does not exist":** the database was created with different credentials. See below.

### Credentials look right but nothing works

**The `POSTGRES_*` values in `.env` only take effect the first time the database volume is created.** Postgres ignores later changes without warning. To recreate the database with the current values:

```bash
docker compose down -v
docker compose up -d
docker compose logs postgres
```

**This deletes all local data.**

### `docker compose up` warns that variables aren't set

There's no `.env` in the repo root. See [step 1](#1-create-the-root-env-file). Run `docker compose` from the repo root.

### The browser says "blocked by CORS policy"

The page's origin isn't in `CORS_ALLOWED_ORIGINS`. Compare the address bar (scheme, host and port) with the list in [Configuration](#configuration). Requests from `curl` or PowerShell are never blocked by CORS, only browsers are.

### `/api/budget/generate` or `/api/ai/test` returns 500

Ollama isn't running, or the model isn't pulled. See [Ollama](#ollama-optional).

---

## Deployment (Azure VM)

The production backend runs on a Windows Server VM in Azure (`bnto-backend.northcentralus.cloudapp.azure.com`). Deployment is manual for now.

```
Browser ──HTTPS:443──> Caddy (C:\caddy) ──HTTP──> Spring Boot jar on :8080 (C:\bnto) ──> PostgreSQL :5432
```

| Part | Where | Notes |
|---|---|---|
| Backend jar | `C:\bnto\backend-<version>.jar` | Started by hand: `java -jar .\backend-<version>.jar` |
| Caddy | `C:\caddy` (`caddy.exe`, `Caddyfile`) | HTTPS with an automatic Let's Encrypt certificate. Start with `.\caddy.exe run` |
| PostgreSQL | Installed directly on Windows, port `5432` | Not Docker |
| Config | Windows environment variables | `POSTGRES_*`, `POSTGRES_PORT=5432`, `JWT_SECRET`. Ask a team lead; never commit them. |
| Network | Azure NSG | 80 and 443 open to everyone. 8080 and RDP only from specific addresses. |

### Deploying a new version

1. Bump `<version>` in `backend/pom.xml`, then build with `.\mvnw.cmd clean package`. The jar is `backend/target/backend-<version>.jar`.
2. Copy it to `C:\bnto` on the VM. Over RDP with your local drive shared, `Copy-Item "\\tsclient\<drive>\...\backend-<version>.jar" C:\bnto`.
3. Stop the running backend (`Ctrl+C` in its window) and start the new jar.
4. Make sure Caddy is running in its own window.
5. From your own machine, check `https://bnto-backend.northcentralus.cloudapp.azure.com/api/health` returns `true`.

**Gotchas:**
- **Stale terminals.** A PowerShell window opened before an environment variable was saved doesn't have it, and the backend then falls back to port 5433 and fails. Use a fresh window, or reload the variable with `$env:NAME = [Environment]::GetEnvironmentVariable("NAME","User")`.
- **Nothing restarts automatically.** The backend and Caddy only live as long as their windows. Disconnecting from RDP is fine; signing out or rebooting stops both.
- **Schema changes.** Hibernate adds new columns, but adding a **required** column fails if the table already has rows. Check the startup log for `ALTER TABLE` warnings.

---

## Secrets

Local database credentials are committed on purpose, as explained above. Real secrets follow different rules:

- Never in git, never in Discord, never in a shared doc.
- Share them through a password manager with a shared vault.
- Deployment secrets live on the host, as environment variables on the VM, not in a file people copy around.
- Dev and production values are always different.

---

## Project structure

```
BNTO-Capstone/
├── docker-compose.yml          # Local Postgres (reads .env)
├── .env.example                # Copy to .env
├── backend/                    # Spring Boot (Java 21)
│   ├── mvnw / mvnw.cmd         # Maven wrapper
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/bnto/backend/
│       │   ├── config/         # Security, JWT, CORS
│       │   ├── controller/     # REST endpoints
│       │   ├── dto/            # Request/response bodies (incl. ApiError)
│       │   ├── exception/      # Exceptions + GlobalExceptionHandler
│       │   ├── model/          # JPA entities (User, Account, BankTransaction)
│       │   ├── repository/     # Spring Data repositories
│       │   └── service/        # Business logic
│       ├── main/resources/application.properties
│       └── test/               # JUnit tests + test-only application.properties (H2)
└── frontend/                   # React + TypeScript (Vite, dev server on :8443)
```

### How the budget feature works

`BudgetService` reads the user's accounts and transactions from Postgres. In transactions, a positive amount is income and a negative amount is spending. Java works out total income, total spending, what's left, and spending by category, then sends only that summary to Ollama, which returns three tips. Ollama never sees the database directly and doesn't do the maths.

---

## Known limitations

- **No accounts or transactions endpoints yet.** The frontend calls `GET /api/accounts`, which doesn't exist; without a token it returns `401`. Accounts and transactions currently only get into the database through tests or SQL.
- **No refresh tokens or logout.** Tokens last 1 hour, and then the user logs in again.
- **Non-US mobile numbers** (`+44…` and so on) return `500` instead of a `400`.
- **Phone duplicates:** `+1 816-555-0100` and `816-555-0100` are stored as different values (`18165550100` vs `8165550100`), so the same phone can register twice.
- **Schema management:** `ddl-auto=update` never drops or renames anything, so the schema can drift from the entities. Move to Flyway before the data matters.
- **No roles:** every logged-in user can reach every protected endpoint.
