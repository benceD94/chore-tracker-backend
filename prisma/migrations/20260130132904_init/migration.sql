-- CreateTable
CREATE TABLE "users" (
    "uid" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "photoURL" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("uid")
);

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_members" (
    "userId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "household_members_pkey" PRIMARY KEY ("userId","householdId")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chores" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "points" INTEGER NOT NULL,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chore_assignments" (
    "choreId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chore_assignments_pkey" PRIMARY KEY ("choreId","userId")
);

-- CreateTable
CREATE TABLE "registry_entries" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "choreId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "times" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registry_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "households_createdBy_idx" ON "households"("createdBy");

-- CreateIndex
CREATE INDEX "household_members_userId_idx" ON "household_members"("userId");

-- CreateIndex
CREATE INDEX "household_members_householdId_idx" ON "household_members"("householdId");

-- CreateIndex
CREATE INDEX "categories_householdId_idx" ON "categories"("householdId");

-- CreateIndex
CREATE INDEX "chores_householdId_idx" ON "chores"("householdId");

-- CreateIndex
CREATE INDEX "chores_categoryId_idx" ON "chores"("categoryId");

-- CreateIndex
CREATE INDEX "chore_assignments_choreId_idx" ON "chore_assignments"("choreId");

-- CreateIndex
CREATE INDEX "chore_assignments_userId_idx" ON "chore_assignments"("userId");

-- CreateIndex
CREATE INDEX "registry_entries_householdId_idx" ON "registry_entries"("householdId");

-- CreateIndex
CREATE INDEX "registry_entries_choreId_idx" ON "registry_entries"("choreId");

-- CreateIndex
CREATE INDEX "registry_entries_userId_idx" ON "registry_entries"("userId");

-- CreateIndex
CREATE INDEX "registry_entries_completedAt_idx" ON "registry_entries"("completedAt");

-- CreateIndex
CREATE INDEX "registry_entries_householdId_completedAt_idx" ON "registry_entries"("householdId", "completedAt");

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chores" ADD CONSTRAINT "chores_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chores" ADD CONSTRAINT "chores_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chore_assignments" ADD CONSTRAINT "chore_assignments_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "chores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chore_assignments" ADD CONSTRAINT "chore_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registry_entries" ADD CONSTRAINT "registry_entries_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registry_entries" ADD CONSTRAINT "registry_entries_choreId_fkey" FOREIGN KEY ("choreId") REFERENCES "chores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registry_entries" ADD CONSTRAINT "registry_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("uid") ON DELETE CASCADE ON UPDATE CASCADE;
