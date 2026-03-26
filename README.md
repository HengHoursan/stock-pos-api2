# Stock POS API (NestJS)

A modularized, feature-driven POS (Point of Sale) API built with NestJS, TypeORM, and Cloudinary.

## 🚀 Core Key Features

- **Modular Architecture:** Highly structured feature modules (Auth, Brand, Category, etc.) to ensure a clean separation of concerns and easy horizontal scaling.
- **RBAC (Role-Based Access Control):** A robust security layer with custom `@Permissions()` guards and `@CurrentUser()` decorators for fine-grained user permission tracking.
- **Advanced File Upload:** Centralized image management using **Cloudinary** with custom validation pipes and interceptors for secure and efficient media handling.
- **Standardized DTO Pattern:** Unified request and response formats across the entire project, utilizing barrel exports for clean and maintainable imports.
- **Path Aliasing:** Full support for `@/` aliases to eliminate "dot-dot" hell in import statements.

## 📂 Project Structure

```text
src/
├── common/                  # Shared utilities and core logic
│   ├── dto/                 # Global DTOs (Pagination, ApiResponse)
│   ├── entity/              # Base entities (abstract)
│   ├── security/            # Security layer (Guards, Decorators, Strategies)
│   └── util/                # Helper functions (Code generation, Slugs, etc.)
│
├── config/                  # Configuration loaders (DB, JWT, Cloudinary)
│
├── modules/                 # Feature-specific modules
│   ├── [auth|brand|category|permission|role|user|upload|...]/
│   │   ├── controller/      # API Endpoints
│   │   ├── dto/             # Request & Response schemas (mapped via index.ts)
│   │   ├── entity/          # TypeORM Entities
│   │   ├── repository/      # Database logic (TypeORM Repositories)
│   │   ├── service/         # Business logic
│   │   └── [module].module.ts
│
├── main.ts                  # Application entry point
└── tsconfig.json            # Path alias configuration (@/)
```

## 🛠️ Getting Started (For Collaborators)

Follow these steps to set up the project locally after cloning:

### 1. Clone the repository
```bash
git clone <repository-url>
cd stock-pos-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and configure the following variables:
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 4. Run the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📜 Development Standards

- **Path Aliases:** Always use `@/` for absolute imports from the `src` directory.
- **DTO Barrel exports:** All module DTOs should be exported through `src/modules/[module]/dto/index.ts`.
- **RBAC:** Use the `@Permissions()` decorator for any new controller methods to enforce security.
- **Current User:** Use `@CurrentUser()` to access the authenticated user's data in controllers.
