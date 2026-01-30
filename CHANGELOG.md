# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Versioning Scheme

This project is currently in **beta** (version 0.x.x):
- **MAJOR** (0.x.x) - Kept at 0 during beta phase
- **MINOR** (x.1.x) - Major features, breaking changes, or significant architectural updates
- **PATCH** (x.x.1) - Minor features, bug fixes, and improvements

When the project reaches production-ready status, it will be released as version 1.0.0.

---

## [0.1.0] - 2026-01-30

### Changed

**Complete migration from Firebase Firestore to PostgreSQL with Prisma ORM**

This release represents a major architectural change, moving from Firebase Firestore to PostgreSQL as the primary database for data storage. Firebase Authentication remains in use for user authentication.

#### Database Migration
- Migrated from Firebase Firestore to PostgreSQL database
- Implemented Prisma ORM (v5.22.0) for database access
- Created comprehensive Prisma schema with proper relational models
- Replaced array-based relationships with proper junction tables:
  - `HouseholdMember` junction table for household membership (replacing `memberIds` array)
  - `ChoreAssignment` junction table for chore assignments (replacing `assignedTo` array)
- Created automated data migration script (`scripts/migrate-data.ts`)
- Successfully migrated production data:
  - 4 users
  - 3 households
  - 15 categories
  - 63 chores
  - 11 registry entries

#### Service Layer Updates
- Replaced `FirebaseService` with `PrismaService` across all modules:
  - `UsersService`: User profile management with Prisma
  - `HouseholdsService`: Household CRUD with junction table support
  - `ChoresService`: Chore management with category and assignment includes
  - `CategoriesService`: Category management
  - `RegistryService`: Registry entries with chore and user data includes
- Eliminated N+1 query problems using Prisma's `include` for JOINs
- Updated `HouseholdAccessGuard` to use junction table lookups
- Removed manual data enrichment (now handled by Prisma includes)

#### Testing
- Updated all service test files to use Prisma mocks:
  - `users.service.spec.ts`
  - `households.service.spec.ts`
  - `chores.service.spec.ts`
  - `categories.service.spec.ts`
  - `registry.service.spec.ts`
- All 87 tests passing

#### Infrastructure
- Added PostgreSQL as primary database
- Configured database connection via `DATABASE_URL` environment variable
- Created `PrismaModule` and `PrismaService` for application-wide database access
- Added Prisma migration files for schema versioning

#### Documentation
- Created `MIGRATION_PLAN.md` with complete migration strategy
- Created `TEST_MIGRATION_GUIDE.md` documenting test migration process
- Updated all service documentation to reflect Prisma usage

### Added
- Prisma ORM integration (`@prisma/client` v5.22.0)
- PostgreSQL database support (`pg` v8.17.2)
- Automated data migration script
- Comprehensive Prisma schema with 7 models:
  - User
  - Household
  - HouseholdMember (junction table)
  - Chore
  - ChoreAssignment (junction table)
  - Category
  - RegistryEntry
- Database indexes for optimized queries
- Foreign key constraints with cascade deletes

### Removed
- Dependency on Firebase Firestore for data storage (Firebase Auth still used)
- `FirebaseService` for database operations
- Array-based relationship management
- Manual data enrichment in services

### Fixed
- N+1 query problems in household and registry queries
- Data integrity issues with array-based relationships
- Inconsistent data fetching patterns

### Technical Details

**Database Schema:**
- All models use proper foreign keys with referential integrity
- Composite unique constraints on junction tables
- Optimized indexes for common query patterns
- Automatic timestamp management (`createdAt`, `updatedAt`)

**Performance Improvements:**
- Single-query data fetching with JOINs (vs. N+1 queries in Firebase)
- Efficient filtering and pagination with Prisma
- Database-level data integrity enforcement

**Breaking Changes:**
- Requires PostgreSQL database setup
- Environment variable `DATABASE_URL` must be configured
- Data must be migrated from Firebase using provided migration script
- Service method signatures remain the same (internal implementation changed)

---

## [0.0.1] - Initial Release

Initial version with Firebase Firestore as the database backend.
