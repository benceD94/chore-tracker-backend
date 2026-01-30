# Chore Tracker Backend

A NestJS-based API for managing household chores, categories, and completion tracking with PostgreSQL and Prisma ORM.

## 📋 Description

This backend API provides a structured interface for a chore tracking application. It handles authentication (via Firebase), household management, chore organization, and completion logging with proper authorization and validation, all backed by a PostgreSQL database.

## ✨ Features

- 🔐 **Firebase Authentication** - Token-based authentication using Firebase ID tokens
- 👥 **Multi-tenant Households** - Manage multiple households with member access control
- 📂 **Category Management** - Organize chores by customizable categories
- ✅ **Chore Tracking** - Create, update, and delete chores with detailed information
- 📊 **Completion Registry** - Track chore completions with time-based filtering
- 🔒 **Authorization Guards** - Household-level access control
- 📝 **Request Validation** - Automatic validation using class-validator
- 📚 **API Documentation** - Interactive Swagger/OpenAPI documentation
- 🎯 **Batch Operations** - Register multiple chore completions at once

## 🛠️ Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Firebase Admin SDK
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Code Quality**: ESLint + Prettier

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

### 1. PostgreSQL Setup

Install and start PostgreSQL:

```bash
# macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Or use Postgres.app (https://postgresapp.com/)

# Create database
createdb chore_tracker
```

### 2. Firebase Setup

Create a Firebase project for authentication:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings → Service Accounts
3. Click "Generate New Private Key"

### 3. Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/chore_tracker?schema=public"

# Firebase Admin SDK (for authentication only)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-private-key-here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Swagger
SWAGGER_ENABLED=true
```

**Important**: Never commit your `.env` file or Firebase service account to version control.

### 4. Run Prisma Migrations

Set up the database schema:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

## 🚀 Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The server will start on `http://localhost:3000`

## 📖 API Documentation

Once the server is running, access the interactive Swagger documentation at:

```
http://localhost:3000/api
```

### Generate Static Swagger Spec

Generate a JSON file containing the complete API specification:

```bash
npm run swagger:generate
```

This creates `swagger-spec.json` which can be imported into Postman, Insomnia, or other API tools.

## 🔑 API Endpoints

### Authentication
- `POST /auth/login` - Validate Firebase ID token
- `POST /auth/logout` - Logout (client-side token removal)
- `GET /auth/me` - Get current authenticated user

### Users
- `GET /users/:uid` - Get user profile by UID
- `POST /users` - Create or update user profile

### Households
- `GET /households` - List all households for current user
- `GET /households/:householdId` - Get specific household
- `POST /households` - Create new household
- `PATCH /households/:householdId` - Update household name
- `POST /households/:householdId/members` - Add member to household

### Categories
- `GET /households/:householdId/categories` - List categories
- `GET /households/:householdId/categories/:id` - Get category
- `POST /households/:householdId/categories` - Create category
- `PATCH /households/:householdId/categories/:id` - Update category
- `DELETE /households/:householdId/categories/:id` - Delete category

### Chores
- `GET /households/:householdId/chores` - List chores
- `GET /households/:householdId/chores/:id` - Get chore
- `POST /households/:householdId/chores` - Create chore
- `PATCH /households/:householdId/chores/:id` - Update chore
- `DELETE /households/:householdId/chores/:id` - Delete chore

### Registry (Completion Tracking)
- `GET /households/:householdId/registry` - List registry entries
  - Query params: `filter` (today|yesterday|thisWeek|lastWeek|thisMonth|all), `userId`, `limit`
- `POST /households/:householdId/registry` - Register single completion
- `POST /households/:householdId/registry/batch` - Register multiple completions

## 🏗️ Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module
├── common/                          # Shared utilities
│   ├── decorators/                  # Custom decorators (@CurrentUser)
│   ├── filters/                     # Exception filters
│   ├── guards/                      # Auth & authorization guards
│   └── interfaces/                  # Shared interfaces
├── firebase/                        # Firebase module
│   ├── firebase.module.ts
│   └── firebase.service.ts          # Firestore wrapper
├── auth/                            # Authentication module
├── users/                           # User management
├── households/                      # Household management
│   └── guards/                      # Household access guard
├── categories/                      # Category management
├── chores/                          # Chore management
└── registry/                        # Completion tracking
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 🎨 Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format
```

## 🔄 CI/CD

### GitHub Actions

This project includes automated workflows for continuous integration and security:

#### CI Workflow (`.github/workflows/ci.yml`)

Runs automatically on every pull request and push to `main`/`develop` branches:

- ✅ **Linting** - Ensures code follows style guidelines
- 🧪 **Unit Tests** - Runs all test suites
- 🏗️ **Build** - Verifies the application compiles successfully
- 📊 **Coverage** - Generates test coverage reports
- 🔢 **Matrix Testing** - Tests against Node.js 18.x and 20.x

#### Security Workflow (`.github/workflows/security.yml`)

Automated security scanning:

- 🔍 **NPM Audit** - Checks for known vulnerabilities in dependencies
- 🛡️ **OSV Scanner** - Google's Open Source Vulnerability scanner for dependency vulnerabilities
- 🔐 **CodeQL Analysis** - Static code analysis for security issues
- ⏰ **Daily Scans** - Runs security audit daily at 00:00 UTC

### Pull Request Template

A PR template is provided to ensure consistent and thorough pull requests:

- Description and change type
- Related issues linking
- Testing checklist
- Review checklist

### Status Badges

Add these to your README once you've enabled the workflows:

```markdown
![CI](https://github.com/username/chore-tracker-backend/workflows/CI/badge.svg)
![Security](https://github.com/username/chore-tracker-backend/workflows/Security%20Scan/badge.svg)
```

## 🔒 Security Features

- **Firebase ID Token Validation** - All protected routes verify Firebase authentication
- **Household Authorization** - Users can only access households they're members of
- **Input Validation** - All request bodies validated with class-validator
- **Request Whitelisting** - Unknown properties stripped from requests
- **Error Handling** - Sanitized error messages (no sensitive data leakage)

## 📝 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `3000` |
| `NODE_ENV` | Environment | No | `development` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes | - |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | Yes | - |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | Yes | - |
| `SWAGGER_ENABLED` | Enable Swagger UI | No | `true` |

## 🚢 Deployment

### Railway Deployment

Railway provides the easiest deployment with built-in PostgreSQL:

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Initialize Project**:
   ```bash
   railway init
   ```

4. **Add PostgreSQL Database**:
   - Go to Railway dashboard
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the `DATABASE_URL` from the PostgreSQL service

5. **Set Environment Variables**:
   ```bash
   railway variables set FIREBASE_PROJECT_ID=your-project-id
   railway variables set FIREBASE_CLIENT_EMAIL=your-client-email
   railway variables set FIREBASE_PRIVATE_KEY="your-private-key"
   railway variables set NODE_ENV=production
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

The `nixpacks.toml` file automatically:
- Installs dependencies
- Generates Prisma client
- Runs database migrations
- Starts the application

**Important**: Railway will automatically run `npx prisma migrate deploy` before starting your app, creating all necessary database tables.

### Manual Build

```bash
npm run build
```

### Other Platform Considerations

1. **Environment Variables**: Ensure `DATABASE_URL` and Firebase credentials are set
2. **Database Migrations**: Run `npm run prisma:migrate` before starting the app
3. **CORS**: Configure allowed origins for production in `main.ts`
4. **Rate Limiting**: Consider adding `@nestjs/throttler`
5. **Logging**: Use structured logging for production
6. **Health Checks**: Add health check endpoint with `@nestjs/terminus`

### Alternative Platforms

- **Heroku** - Add Heroku Postgres addon
- **Render** - Automatic deploys with PostgreSQL
- **DigitalOcean App Platform** - Managed PostgreSQL database
- **Google Cloud Run** - Cloud SQL for PostgreSQL

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Swagger/OpenAPI](https://swagger.io/specification/)
- [TypeScript](https://www.typescriptlang.org/)

## 📄 License

This project is [UNLICENSED](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 👨‍💻 Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Firestore enabled
- Firebase service account credentials

### First Time Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your Firebase credentials in .env

# Start development server
npm run start:dev

# Visit http://localhost:3000/api for Swagger docs
```

### Database Schema

The application uses Firestore with the following collections:

- `users` - User profiles
- `households` - Household information
  - `categories` (subcollection) - Chore categories
  - `chores` (subcollection) - Chores
  - `registry` (subcollection) - Completion records

### Creating Firestore Indexes

Some queries may require composite indexes. Create them via Firebase Console or using:

```bash
firebase deploy --only firestore:indexes
```

## 🐛 Troubleshooting

### Firebase Authentication Errors

- Verify your service account credentials are correct
- Ensure the private key includes `\n` newlines (or use the file path alternative)
- Check that your Firebase project ID matches

### CORS Issues

- Update CORS settings in `main.ts` for production domains
- Ensure frontend sends proper `Authorization: Bearer <token>` headers

### Build Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Swagger API documentation
