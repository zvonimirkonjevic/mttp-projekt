# FlashSlides - AI

This is a monorepo for FlashSlides AI microservices located in the `./src` directory.

## Table of Contents

**Getting Started**:
- [Quick Start for New Developers](#quick-start-for-new-developers)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-file)
- [Branching Strategy & Development Workflow](#branching-strategy--development-workflow)

**Quality Assurance & Testing**:
- [Tests](#tests) - Running tests, test suite overview, CI/CD integration
- [Development Best Practices](#development-best-practices)

**Architecture**:
- [Architecture Overview](#architecture-overview)
- [Microservices](#list-of-microservices)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Frontend Integration](#frontend-integration)

**Development**:
- [Local Development Commands](#local-development)
- [Error Handling & Logging](#error-handling--logging)
- [CORS Configuration](#cors-configuration)

**Infrastructure**:
- [Billing & Stripe Integration](#billing--stripe-integration)
- [LocalStack Setup](#localstack-setup-local-aws-emulation)
- [Docker Configuration](#updating-requirements-and-how-image-is-built)

**Resources**:
- [Documentation](#documentation) - Detailed component docs
- [Troubleshooting](#troubleshooting)

## Architecture Overview

FlashSlides AI is a full-stack application for generating AI-powered presentation slides.

**Technology Stack**:
- **Backend**: Python 3.11, FastAPI, SQLAlchemy (async + sync), PostgreSQL
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, React Query
- **Authentication**: Supabase Auth with JWT tokens (ES256)
- **AI/LLM**: Google Gemini, OpenAI (GPT), Anthropic (Claude)
- **Payments**: Stripe Checkout + Webhooks
- **Infrastructure**: Docker, LocalStack (local AWS emulation), AWS SSM (secrets management)

**Data Flow**:
```
User → Next.js Frontend → FastAPI Backend → PostgreSQL
                    ↓
              Supabase Auth (JWT)
                    ↓
            Stripe (Payments) → Webhook → Credit Update
                    ↓
              LLM APIs (Gemini, OpenAI, Anthropic)
```

**Project Structure**:
```
flashslides-ai/
├── src/
│   ├── api/              # Backend FastAPI service
│   │   ├── src/
│   │   │   ├── api_components/     # Feature modules (auth, billing, profile, etc.)
│   │   │   ├── common/             # Shared utilities, database, models
│   │   │   └── main.py             # FastAPI app entry point
│   │   └── environment/            # Docker configs
│   │
│   └── app/              # Frontend Next.js application
│       ├── src/
│       │   ├── app/                # Next.js 14 app directory (pages)
│       │   ├── components/         # React components
│       │   ├── contexts/           # React contexts (UserContext, etc.)
│       │   ├── hooks/              # Custom React hooks
│       │   └── lib/                # Utilities
│       └── environment/            # Docker configs
│
├── scripts/              # Utility scripts (LocalStack init, etc.)
├── documentation/        # Detailed system documentation
├── notebooks/            # Jupyter notebooks for experiments
├── docker-compose.yml    # Multi-service orchestration
├── Makefile              # Development commands
└── README.md            # This file
```

**Key Design Patterns**:
- **Microservices**: Separate frontend and backend services
- **API-First**: RESTful API with OpenAPI/Swagger documentation
- **Async Processing**: Async SQLAlchemy for high-concurrency operations
- **Idempotent Webhooks**: Stripe webhook handling prevents duplicate processing
- **Self-Healing**: Frontend auto-creates users on first login if missing
- **Transaction Safety**: Row-level locking for credit updates
- **Structured Logging**: Loguru with contextual information
- **Environment Parity**: LocalStack mimics AWS for local development

## List of microservices:
- `src/api` - **AI API** - Python FastAPI backend service that handles content generation logic, LLM integration (Gemini), user authentication, profile management, and billing.
- `src/app` - **Frontend App** - Next.js 14 application providing the user interface for generating, editing, and previewing content, along with user profile management and billing pages.

## Prerequisites
- Docker & Docker Compose
- Make (for running easy commands)
- Git
- [Stripe CLI](https://docs.stripe.com/stripe-cli) (for testing billing locally)
- [awscli-local](https://github.com/localstack/awscli-local) (optional, for LocalStack debugging)

## Quick Start for New Developers

Follow these steps to get FlashSlides AI running locally:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd flashslides-ai
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env  # Or create .env manually (see Environment file section)
   ```

3. **Build and start services**:
   ```bash
   make flashslides-build
   make flashslides-run
   ```

4. **Verify LocalStack seeded parameters**:
   ```bash
   awslocal ssm get-parameters-by-path --path "/flashslides/local/"
   ```

5. **Access the application**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API Docs: [http://localhost:3001/docs](http://localhost:3001/docs)

6. **Set up Stripe webhooks** (for billing development):
   ```bash
   stripe login
   stripe listen --forward-to localhost:3001/api/v1/stripe-webhook
   # Copy the webhook secret (whsec_...) to your .env as STRIPE_WEBHOOK_SECRET
   ```

7. **Check logs**:
   ```bash
   make flashslides-logs
   ```

## Environment file

Here is outlined how to set required environment variables for local development.

Environment variables should be stored in `./.env` file. This file is used by the `docker-compose.yml` file to set the environment variables for the containers.

Set the following environment variables in the `./.env` file:

```bash
# Core Configuration
ENV=local                   # specifies the environment you are running in (local/dev/prod)
LOG_LEVEL=DEBUG             # logging level

# AWS (required for SSM client to initialize against LocalStack)
AWS_DEFAULT_REGION=eu-central-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# Database Configuration
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=flashslides
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Frontend API Configuration (optional - defaults to localhost:3001)
NEXT_PUBLIC_API_CONTAINER_URL=http://localhost:3001
```

**Note**: Most secrets (API keys, JWT secrets, Stripe keys) are fetched from AWS Systems Manager Parameter Store at runtime. In local development, these are stored in LocalStack (see LocalStack section below).

## Branching Strategy & Development Workflow

### Issue Tracking
We use **Linear** for issue tracking. All work should be associated with a Linear ticket.

### Branch Naming Convention
Format: `username/ticket_identifier-title`

Examples:
- `alice/FLA-123-add-theme-toggle`
- `bob/FLA-456-fix-auth-bug`
- `charlie/FLA-789-update-billing-flow`

### Git Workflow

**Main branches**:
- `main` - Production-ready code
- `dev` - Development branch for integration

**Feature development flow**:
1. **Create Linear ticket** and note the ticket identifier (e.g., FLA-123)

2. **Create feature branch** from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b username/FLA-123-add-theme-toggle
   ```

3. **Develop and commit**:
   ```bash
   # Make changes
   git add .
   git commit -m "add theme toggle component"
   ```

4. **Push to remote**:
   ```bash
   git push origin username/FLA-123-add-theme-toggle
   ```

5. **Open Pull Request**:
   - Target branch: `dev` (not `main`)
   - Link the Linear ticket in PR description
   - Add descriptive title and summary of changes
   - Request review from team members

6. **After PR approval and merge**:
   ```bash
   git checkout dev
   git pull origin dev
   git branch -d username/FLA-123-add-theme-toggle
   ```

### Commit Message Guidelines

Use clear, descriptive commit messages:
- **Good**: `add user profile update endpoint with validation`
- **Good**: `fix stripe webhook idempotency issue`
- **Bad**: `update code`
- **Bad**: `fix bug`

### Before Submitting PR

Checklist:
- [ ] Code follows existing patterns and style
- [ ] No commented-out code or debug logs
- [ ] Environment variables are documented if added
- [ ] API changes are reflected in OpenAPI docs
- [ ] Database migrations created if schema changed
- [ ] **All tests pass** with `make flashslides-test`
- [ ] Tested locally with `make flashslides-run`
- [ ] Linear ticket linked in PR description

## Tests

**Complete Documentation**: [Testing Suite Documentation](documentation/testing_suite.md)

### Frontend Unit Tests

```bash
make flashslides-test
make flashslides-test-watch
make flashslides-test-coverage
```

**Test Coverage**:
- Authentication (login, signup, OAuth, JWT validation)
- Billing & Credits (Stripe checkout, payment handling)
- User Context (state management, self-healing)
- Middleware (route protection, redirects)
- Components (forms, UI interactions)

**Test Structure**:
```
src/__tests__/
├── app/actions/      # Server actions
├── components/       # React components
├── contexts/         # Context providers
├── hooks/            # Custom hooks
└── middleware.test.ts
```

### CI/CD Integration

GitHub Actions example:
```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: cd src/app && npm ci
    - run: cd src/app && npm test -- --coverage
    - uses: codecov/codecov-action@v3
      with:
        files: ./src/app/coverage/lcov.info
```

## Local Development

We use `Makefile` for common commands, please check it out.

`Makefile` also support `<tab>` completion, to enable it add this to your `.zshrc` or `.bashrc`:

```bash
autoload -Uz compinit && compinit
```

### Commands

**Core Commands**:
- `make flashslides-build` - Build local Flashslides images (run after dependency changes)
- `make flashslides-run` - Start all services (API, Frontend, PostgreSQL, LocalStack)
- `make flashslides-stop` - Stop all running services
- `make flashslides-logs` - Show logs from all services (live tail)
- `make flashslides-clear-cache` - Clear Docker build cache

**Common Development Workflows**:

**Starting a new development session**:
```bash
make flashslides-run
make flashslides-logs  # Monitor logs in separate terminal
```

**After changing Python dependencies** (`requirements.txt`):
```bash
make flashslides-stop
make flashslides-build
make flashslides-run
```

**After changing Node dependencies** (`package.json`):
```bash
make flashslides-stop
make flashslides-build
make flashslides-run
```

**Restarting a single service**:
```bash
docker restart flashslides-api-1     # Restart backend only
docker restart flashslides-app-1     # Restart frontend only
```

**Viewing logs for specific service**:
```bash
docker logs -f flashslides-api-1     # Backend logs
docker logs -f flashslides-app-1     # Frontend logs
docker logs -f flashslides-postgres-1 # Database logs
docker logs -f localstack-main       # LocalStack logs
```

**Accessing service shells**:
```bash
docker exec -it flashslides-api-1 bash    # Backend container shell
docker exec -it flashslides-app-1 sh      # Frontend container shell
docker exec -it flashslides-postgres-1 bash # Database container shell
```

**Database operations**:
```bash
# Connect to PostgreSQL
docker exec -it flashslides-postgres-1 psql -U postgres -d flashslides

# Run SQL queries
SELECT * FROM users;
SELECT * FROM transactions;
\dt  # List tables
\q   # Exit
```

Once running:
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **API Docs**: [http://localhost:3001/docs](http://localhost:3001/docs)

## API Endpoints

The API provides several core endpoints for authentication, user management, and billing.

**Key Endpoints:**
- **POST** `/api/v1/authenticate-jwt` - JWT authentication with auto-user creation
- **PATCH** `/api/v1/update_profile` - Update user profile information
- **POST** `/api/v1/create-checkout-session` - Initiate credit purchase
- **POST** `/api/v1/stripe-webhook` - Handle payment webhooks

**Documentation:**
- [Interactive API Docs](http://localhost:3001/docs) (when running locally)
- [Authentication & Token Validation](documentation/token_validator.md)
- [User Profile Management](documentation/user_profile.md)
- [Billing System](documentation/billing.md)

### Billing & Stripe Integration

FlashSlides AI uses Stripe for credit purchases. See [Billing System documentation](documentation/billing.md) for complete details.

**Key Features**:
- Credit packages: 500, 1000, 2500, 5000, 10000 credits
- Idempotent webhook processing
- Transaction audit trail
- Row-level locking for concurrency safety

To test billing locally, install the [Stripe CLI](https://docs.stripe.com/stripe-cli):

1. **Login to Stripe**:
   ```bash
   stripe login
   ```
   Follow the instructions in the terminal to authenticate.

2. **Start the webhook listener**:
   Forward Stripe events to your local API endpoint.
   
   If running via Docker (default port 3001):
   ```bash
   stripe listen --forward-to localhost:3001/api/v1/stripe-webhook
   ```
   
   If running locally without Docker (default port 8000):
   ```bash
   stripe listen --forward-to localhost:8000/api/v1/stripe-webhook
   ```

   Copy the webhook signing secret (starts with `whsec_`) from the output and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`.

## Database

FlashSlides AI uses **PostgreSQL** with SQLAlchemy ORM (both sync and async patterns).

**Key Models:**
- **User** - Identity, profile, billing, preferences (JSONB)
- **Transaction** - Billing audit trail with idempotency

**Connection Patterns:**
- Synchronous for simple CRUD
- Asynchronous for webhooks and concurrent operations

**Full Documentation:**
- [Database Architecture & Models](documentation/database.md)
- [User Profile Management](documentation/user_profile.md)
- [Billing Transactions](documentation/billing.md)

## LocalStack Setup (Local AWS Emulation)

FlashSlides AI uses [LocalStack](https://github.com/localstack/localstack) to emulate AWS services (SSM, Secrets Manager, etc.) for local development.

### How it works
- LocalStack runs as a Docker container (see `docker-compose.yml`).
- On startup, scripts in `scripts/` (notably `localstack_init.sh`) are executed to seed SSM parameters used by the services.
- The backend fetches runtime secrets and API keys from AWS Systems Manager Parameter Store (SSM). In `local` mode the code points the SSM client to LocalStack; in `dev`/`prod` it uses real AWS SSM.

Notes:
- Secrets and parameters are read at process startup and injected into the application environment (e.g. `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `AUTH_JWT_SECRET`, etc.).
- For local development the app still expects minimal AWS credentials in `.env` so the SSM client can initialize against LocalStack (see the `src/api/src/env.py` assertions).

### Running LocalStack
- LocalStack is started automatically with `make flashslides-run` (via Docker Compose).
- Ports:
  - 4566: LocalStack Gateway (main endpoint)
  - 4510-4559: AWS service endpoints

### Seeding Secrets/Parameters
- The script `scripts/localstack_init.sh` seeds SSM parameters and (optionally) Secrets Manager with API keys and config for local/dev/prod.
- You can modify this script to add or change secrets as needed.

Important: the application expects SSM parameter names in the form `/flashslides/{ENV}/{component}/{KEY}`.

**Required Parameters for Backend (API)**:
- `/flashslides/{ENV}/api/OPENAI_API_KEY` - OpenAI API key for LLM features
- `/flashslides/{ENV}/api/ANTHROPIC_API_KEY` - Anthropic API key (if using Claude)
- `/flashslides/{ENV}/api/GOOGLE_API_KEY` - Google API key for Gemini LLM
- `/flashslides/{ENV}/api/DATABASE_PASSWORD` - PostgreSQL password
- `/flashslides/{ENV}/api/AUTH_JWT_SECRET` - JWT signing secret for token validation
- `/flashslides/{ENV}/api/SUPABASE_URL` - Supabase project URL (if using Supabase auth)
- `/flashslides/{ENV}/api/SUPABASE_KEY` - Supabase service role key

**Required Parameters for Frontend (App)**:
- `/flashslides/{ENV}/app/STRIPE_SECRET_KEY` - Stripe secret key for payment processing
- `/flashslides/{ENV}/app/STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `/flashslides/{ENV}/app/NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL for client-side auth
- `/flashslides/{ENV}/app/NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public Supabase anon key

When `ENV=local` the `/flashslides/local/...` parameters are seeded into LocalStack by `scripts/localstack_init.sh` and the application reads them from the LocalStack SSM endpoint.

### Example: Add a new secret
Edit `scripts/localstack_init.sh` and add a new `awslocal ssm put-parameter` or `awslocal secretsmanager create-secret` command.

### Useful Commands
- To manually run the init script:
  ```bash
  docker exec -it localstack-main bash /etc/localstack/init/ready.d/localstack_init.sh
  ```
- To inspect parameters:
  ```bash
  awslocal ssm get-parameters-by-path --path "/flashslides/local/"
  ```

### Local development checklist (ENV=local)
Before starting the stack for local development ensure the following are present in `./.env`:

```bash
# Core
ENV=local
LOG_LEVEL=DEBUG

# AWS (required for SSM client to initialize against LocalStack)
AWS_DEFAULT_REGION=eu-central-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test

# Optional local overrides (you can seed these into LocalStack instead)
# STRIPE_WEBHOOK_SECRET=whsec_...
```

Steps to start and verify local secrets fetch:

1. Start the stack (LocalStack + services):

```bash
make flashslides-run
```

2. Ensure LocalStack seeding script ran (it is mounted under `/etc/localstack/init/ready.d`). If you need to re-run it manually:

```bash
docker exec -it localstack-main bash /etc/localstack/init/ready.d/localstack_init.sh
```

3. Inspect seeded SSM parameters:

```bash
awslocal ssm get-parameters-by-path --path "/flashslides/local/"
```

4. Check API logs to confirm environment variables were loaded from SSM at startup:

```bash
make flashslides-logs
```

Troubleshooting
- If the API fails at startup with assertions about missing AWS env vars, ensure `AWS_DEFAULT_REGION`, `AWS_ACCESS_KEY_ID`, and `AWS_SECRET_ACCESS_KEY` are present in `./.env` when `ENV=local`.
- If SSM parameters are not found, re-run the init script and re-check with `awslocal`.

See the script and `docker-compose.yml` for more details.

## Updating requirements and how image is built

For building the docker images we use `Dockerfile.local` located in each service's environment folder.
- `src/api/environment/Dockerfile.local`
- `src/app/environment/Dockerfile.local`

Use `make flashslides-build` to rebuild these images after changing dependencies (like `requirements.txt` or `package.json`).

## Frontend Integration

### Key Patterns

**User Profile Management:**
- Custom `useUserProfile` hook for profile updates
- React Query for state management
- Settings pages at `/settings/*` (details, billing, topup)

**Authentication:**
- Self-healing user creation pattern
- JWT validation on all requests
- UserContext for global state

**API Integration:**
- Base URL: `NEXT_PUBLIC_API_CONTAINER_URL` (default: `http://localhost:3001`)
- Consistent error response format

**Documentation:**
- [User Profile Management](documentation/user_profile.md)
- [Authentication & Token Validation](documentation/token_validator.md)
- [Error Handling](documentation/error_handling.md)

## Error Handling & Logging

### Exception Pattern

All endpoints use `ExceptionWithErrorType` for consistent error responses:

```python
from src.common.exceptions import ExceptionWithErrorType

raise ExceptionWithErrorType(
    message="User not found",
    error_type="USER_NOT_FOUND"
)
```

### Logging

Uses [Loguru](https://github.com/Delgan/loguru) for structured logging:

```python
from loguru import logger

logger.info("User profile updated", user_id=user_id)

# For exceptions, use traceback.format_exc()
import traceback
logger.error(f"Operation failed: {str(e)}\n{traceback.format_exc()}")
```

**Log Level**: Set via `LOG_LEVEL` environment variable.

### Transaction Safety

Use async transactions with row-level locking for critical operations:

```python
async with get_async_db() as db:
    async with db.begin():
        result = await db.execute(
            select(User).with_for_update().where(...)
        )
        # Auto-commit on success, auto-rollback on exception
```

**Full Documentation:**
- [Error Handling System](documentation/error_handling.md)
- [Database Transactions](documentation/database.md)

## Development Best Practices

### Backend Development

#### Adding a New API Endpoint

1. **Create endpoint directory** in [src/api/src/api_components/](src/api/src/api_components/):
   ```
   src/api/src/api_components/your_feature/
   ├── __init__.py
   ├── routers.py       # FastAPI route handlers
   ├── models.py        # Pydantic request/response models
   └── service.py       # Business logic (optional)
   ```

2. **Define Pydantic models** in `models.py`:
   ```python
   from pydantic import BaseModel, Field

   class YourFeatureRequest(BaseModel):
       field1: str = Field(..., description="Description")
       field2: int = Field(default=0)

   class YourFeatureResponse(BaseModel):
       success: bool
       message: str
   ```

3. **Create router** in `routers.py`:
   ```python
   from fastapi import APIRouter, Depends
   from sqlalchemy.orm import Session
   from src.common.database import get_db
   from src.common.exceptions import ExceptionWithErrorType
   from .models import YourFeatureRequest, YourFeatureResponse

   router = APIRouter()

   @router.post("/your-endpoint", response_model=YourFeatureResponse)
   def your_endpoint(
       request: YourFeatureRequest,
       db: Session = Depends(get_db)
   ):
       try:
           # Implementation
           return YourFeatureResponse(success=True, message="Success")
       except Exception as e:
           raise ExceptionWithErrorType(
               message=str(e),
               error_type="YOUR_ERROR_TYPE"
           )
   ```

4. **Register router** in [src/api/src/main.py](src/api/src/main.py):
   ```python
   from src.api_components.your_feature.routers import router as your_feature_router
   app.include_router(your_feature_router, prefix="/api/v1", tags=["your-feature"])
   ```

#### Database Operations

**Prefer async for webhooks and concurrent operations**:
```python
from src.common.async_database import get_async_db
from sqlalchemy import select

async def process_webhook(user_id: UUID, credits: int):
    async with get_async_db() as db:
        async with db.begin():
            result = await db.execute(
                select(User).with_for_update().where(User.user_id == user_id)
            )
            user = result.scalar_one_or_none()
            user.credits_balance += credits
```

**Use sync for simple CRUD**:
```python
from src.common.database import get_db

def get_user_profile(user_id: UUID, db: Session):
    return db.query(User).filter(User.user_id == user_id).first()
```

#### Error Handling Pattern

Always use `ExceptionWithErrorType` for consistent error responses:
```python
from src.common.exceptions import ExceptionWithErrorType

# Don't do this:
raise ValueError("User not found")

# Do this:
raise ExceptionWithErrorType(
    message="User not found",
    error_type="USER_NOT_FOUND"
)
```

#### Logging

Use Loguru with contextual information:
```python
from loguru import logger

# Add context to logs
logger.info("Profile updated", user_id=str(user_id), fields_changed=["first_name", "last_name"])

# Error logging with traceback
import traceback
try:
    # operation
except Exception as e:
    logger.error(f"Operation failed: {str(e)}\n{traceback.format_exc()}")
    raise
```

### Frontend Development

#### Adding a New Settings Page

1. **Create page** in [src/app/src/app/settings/](src/app/src/app/settings/):
   ```tsx
   // src/app/src/app/settings/your-page/page.tsx
   "use client";

   import { useUser } from "@/contexts/UserContext";

   export default function YourSettingsPage() {
     const { user } = useUser();

     return (
       <div>
         <h1>Your Settings</h1>
         {/* Your UI */}
       </div>
     );
   }
   ```

2. **Add navigation** in settings layout

3. **Create API hook** if needed:
   ```tsx
   // src/app/src/hooks/useYourFeature.ts
   import { useMutation, useQueryClient } from "@tanstack/react-query";

   export function useYourFeature() {
     const queryClient = useQueryClient();

     const mutation = useMutation({
       mutationFn: async (data) => {
         const response = await fetch("/api/v1/your-endpoint", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(data),
         });
         if (!response.ok) throw new Error("Request failed");
         return response.json();
       },
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["user"] });
       },
     });

     return { mutate: mutation.mutate, isLoading: mutation.isPending };
   }
   ```

#### State Management

- **UserContext**: For global user state and authentication
- **React Query**: For server state, caching, and mutations
- **useState**: For local component state only

#### API Calls

Always use the configured API URL:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_CONTAINER_URL || "http://localhost:3001";

const response = await fetch(`${API_URL}/api/v1/endpoint`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  },
  body: JSON.stringify(data),
});
```

### Code Style Guidelines

**Python (Backend)**:
- Follow PEP 8
- Use type hints: `def function(param: str) -> dict:`
- Prefer f-strings: `f"User {user_id} not found"`
- Use async/await for I/O operations
- Keep functions focused and single-purpose

**TypeScript (Frontend)**:
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use proper typing (avoid `any`)
- Extract complex logic into custom hooks
- Keep components small and composable

## CORS Configuration

**Current Setup** ([src/api/src/main.py](src/api/src/main.py)):
```python
origins = [
    "http://localhost:3000",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)
```

**For Production Deployment**:
1. Add production domain to `origins` list
2. Consider parameterizing via environment variable: `ALLOWED_ORIGINS=https://app.flashslides.ai,https://flashslides.ai`
3. Remove localhost origins in production builds
4. Ensure HTTPS is enforced

## Other

### Documentation

Detailed architectural documentation for core systems is located in [`documentation/`](documentation/):

**Core Systems:**
- **[Database Architecture](documentation/database.md)** - Schema, models, connection patterns
- **[Error Handling](documentation/error_handling.md)** - Exception patterns, logging, transactions
- **[Authentication & Token Validation](documentation/token_validator.md)** - JWT validation, user creation flow

**Features:**
- **[Billing System](documentation/billing.md)** - Credit packages, Stripe integration, webhooks
- **[User Profile Management](documentation/user_profile.md)** - Profile updates, JSONB preferences

### Notebooks
Check `notebooks/` directory for Jupyter notebooks used for POCs and experiments (e.g., `flashslides-template-filling-poc.ipynb`).

## Troubleshooting

### Common Issues for New Developers

#### 1. API fails to start with "AssertionError" about AWS environment variables
**Problem**: Backend can't initialize SSM client for LocalStack.

**Solution**: Ensure these variables are in `./.env`:
```bash
AWS_DEFAULT_REGION=eu-central-1
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

#### 2. Database connection errors
**Problem**: API can't connect to PostgreSQL.

**Solution**:
- Check if postgres container is running: `docker ps | grep postgres`
- Verify database credentials in `.env` match those in `docker-compose.yml`
- Check logs: `make flashslides-logs`

#### 3. SSM parameters not found (Empty result from awslocal)
**Problem**: LocalStack didn't seed parameters correctly.

**Solution**: Manually run the init script:
```bash
docker exec -it localstack-main bash /etc/localstack/init/ready.d/localstack_init.sh
```

Then verify:
```bash
awslocal ssm get-parameters-by-path --path "/flashslides/local/"
```

#### 4. Frontend can't reach API (CORS or connection errors)
**Problem**: API URL misconfigured or CORS blocking requests.

**Solution**:
- Check `NEXT_PUBLIC_API_CONTAINER_URL` in `.env` (should be `http://localhost:3001`)
- Verify API is running: `curl http://localhost:3001/docs`
- Check CORS origins in `src/api/src/main.py` include your frontend URL

#### 5. User not found errors after OAuth login
**Problem**: User record doesn't exist in database yet.

**Solution**: This is expected on first login. The frontend should automatically call `/authenticate-jwt` to create the user. Check:
- JWT token is valid
- `authenticate-jwt` endpoint is working: Check API logs
- Frontend error handling triggers user creation flow

#### 6. Stripe webhooks not working locally
**Problem**: Payments complete but credits don't update.

**Solution**:
- Ensure Stripe CLI is running: `stripe listen --forward-to localhost:3001/api/v1/stripe-webhook`
- Copy webhook secret to `.env`: `STRIPE_WEBHOOK_SECRET=whsec_...`
- Restart API after updating `.env`
- Check webhook logs in Stripe CLI output

#### 7. Docker build fails with "no space left on device"
**Problem**: Docker has run out of disk space.

**Solution**:
```bash
# Clean up unused Docker resources
docker system prune -a --volumes

# Then rebuild
make flashslides-build
```

#### 8. Port already in use errors
**Problem**: Ports 3000, 3001, 5432, or 4566 are already occupied.

**Solution**:
```bash
# Find process using port
lsof -i :3000  # or :3001, :5432, :4566

# Kill the process or stop conflicting services
# Then restart: make flashslides-run
```

#### 9. Changes to requirements.txt or package.json not reflected
**Problem**: Docker image wasn't rebuilt after dependency changes.

**Solution**:
```bash
make flashslides-build  # Rebuild images
make flashslides-run    # Restart containers
```

#### 10. Environment variables not loading in API
**Problem**: SSM parameters override `.env` values.

**Solution**:
- In local development, secrets come from LocalStack SSM, not `.env`
- Update values in `scripts/localstack_init.sh`
- Re-run the init script (see issue #3 above)
- Or temporarily set values directly in `.env` and modify code to prioritize env vars

### Debugging Tips

**View all running containers**:
```bash
docker ps
```

**View logs for specific service**:
```bash
docker logs -f flashslides-api-1
docker logs -f flashslides-app-1
docker logs -f localstack-main
```

**Access container shell**:
```bash
docker exec -it flashslides-api-1 bash
docker exec -it flashslides-app-1 bash
```

**Check database directly**:
```bash
docker exec -it flashslides-postgres-1 psql -U postgres -d flashslides
```

**Reset everything** (nuclear option):
```bash
make flashslides-stop
docker system prune -a --volumes
make flashslides-build
make flashslides-run
```

