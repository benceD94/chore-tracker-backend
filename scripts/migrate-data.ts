import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

const db = admin.firestore();

async function migrateData() {
  console.log('Starting data migration from Firestore to PostgreSQL...\n');

  try {
    // 1. Migrate Users
    console.log('📦 Migrating users...');
    const usersSnapshot = await db.collection('users').get();
    let userCount = 0;

    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      await prisma.user.upsert({
        where: { uid: doc.id },
        create: {
          uid: doc.id,
          email: data.email || null,
          displayName: data.displayName || null,
          photoURL: data.photoURL || null,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        },
        update: {
          email: data.email || null,
          displayName: data.displayName || null,
          photoURL: data.photoURL || null,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        },
      });
      userCount++;
    }
    console.log(`✅ Migrated ${userCount} users\n`);

    // 2. Migrate Households
    console.log('📦 Migrating households...');
    const householdsSnapshot = await db.collection('households').get();
    let householdCount = 0;

    for (const doc of householdsSnapshot.docs) {
      const data = doc.data();

      // Create household
      await prisma.household.upsert({
        where: { id: doc.id },
        create: {
          id: doc.id,
          name: data.name,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        },
        update: {
          name: data.name,
          createdBy: data.createdBy,
          updatedAt: data.updatedAt?.toDate() || new Date(),
        },
      });

      // Create household members from memberIds array
      if (data.memberIds && Array.isArray(data.memberIds)) {
        for (const memberId of data.memberIds) {
          await prisma.householdMember.upsert({
            where: {
              userId_householdId: {
                userId: memberId,
                householdId: doc.id,
              },
            },
            create: {
              userId: memberId,
              householdId: doc.id,
            },
            update: {},
          });
        }
      }
      householdCount++;
    }
    console.log(`✅ Migrated ${householdCount} households\n`);

    // 3. Migrate Categories
    console.log('📦 Migrating categories...');
    let categoryCount = 0;

    for (const householdDoc of householdsSnapshot.docs) {
      const categoriesSnapshot = await db
        .collection(`households/${householdDoc.id}/categories`)
        .get();

      for (const catDoc of categoriesSnapshot.docs) {
        const data = catDoc.data();
        await prisma.category.upsert({
          where: { id: catDoc.id },
          create: {
            id: catDoc.id,
            householdId: householdDoc.id,
            name: data.name,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          },
          update: {
            name: data.name,
            updatedAt: data.updatedAt?.toDate() || new Date(),
          },
        });
        categoryCount++;
      }
    }
    console.log(`✅ Migrated ${categoryCount} categories\n`);

    // 4. Migrate Chores
    console.log('📦 Migrating chores...');
    let choreCount = 0;

    for (const householdDoc of householdsSnapshot.docs) {
      const choresSnapshot = await db
        .collection(`households/${householdDoc.id}/chores`)
        .get();

      for (const choreDoc of choresSnapshot.docs) {
        const data = choreDoc.data();

        // Create chore
        await prisma.chore.upsert({
          where: { id: choreDoc.id },
          create: {
            id: choreDoc.id,
            householdId: householdDoc.id,
            name: data.name,
            description: data.description || null,
            points: data.points,
            categoryId: data.categoryId || null,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          },
          update: {
            name: data.name,
            description: data.description || null,
            points: data.points,
            categoryId: data.categoryId || null,
            updatedAt: data.updatedAt?.toDate() || new Date(),
          },
        });

        // Create chore assignments from assignedTo array
        if (data.assignedTo && Array.isArray(data.assignedTo)) {
          // First delete existing assignments for this chore
          await prisma.choreAssignment.deleteMany({
            where: { choreId: choreDoc.id },
          });

          // Then create new ones
          for (const userId of data.assignedTo) {
            await prisma.choreAssignment.upsert({
              where: {
                choreId_userId: {
                  choreId: choreDoc.id,
                  userId: userId,
                },
              },
              create: {
                choreId: choreDoc.id,
                userId: userId,
              },
              update: {},
            });
          }
        }
        choreCount++;
      }
    }
    console.log(`✅ Migrated ${choreCount} chores\n`);

    // 5. Migrate Registry Entries
    console.log('📦 Migrating registry entries...');
    let registryCount = 0;
    let skippedRegistry = 0;

    for (const householdDoc of householdsSnapshot.docs) {
      const registrySnapshot = await db
        .collection(`households/${householdDoc.id}/registry`)
        .get();

      for (const regDoc of registrySnapshot.docs) {
        const data = regDoc.data();

        // Skip entries with missing required fields
        if (!data.choreId || !data.userId) {
          console.log(`⚠️  Skipping registry entry ${regDoc.id} - missing choreId or userId`);
          skippedRegistry++;
          continue;
        }

        await prisma.registryEntry.upsert({
          where: { id: regDoc.id },
          create: {
            id: regDoc.id,
            householdId: householdDoc.id,
            choreId: data.choreId,
            userId: data.userId,
            times: data.times || 1,
            completedAt: data.completedAt?.toDate() || new Date(),
            createdAt: data.createdAt?.toDate() || new Date(),
          },
          update: {
            times: data.times || 1,
            completedAt: data.completedAt?.toDate() || new Date(),
          },
        });
        registryCount++;
      }
    }
    console.log(`✅ Migrated ${registryCount} registry entries`);
    if (skippedRegistry > 0) {
      console.log(`⚠️  Skipped ${skippedRegistry} registry entries with missing data\n`);
    } else {
      console.log('');
    }

    console.log('🎉 Migration completed successfully!\n');
    console.log('Summary:');
    console.log(`  - Users: ${userCount}`);
    console.log(`  - Households: ${householdCount}`);
    console.log(`  - Categories: ${categoryCount}`);
    console.log(`  - Chores: ${choreCount}`);
    console.log(`  - Registry Entries: ${registryCount}`);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration
migrateData()
  .catch((e) => {
    console.error('Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await admin.app().delete();
  });
