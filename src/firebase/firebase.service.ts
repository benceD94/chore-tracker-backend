import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firestore: admin.firestore.Firestore;
  private auth: admin.auth.Auth;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error(
        'Firebase configuration is missing. Please set FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, and FIREBASE_CLIENT_EMAIL in your environment variables.',
      );
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey: privateKey.replace(/\\n/g, '\n'),
          clientEmail,
        }),
      });

      this.firestore = admin.firestore();
      this.auth = admin.auth();

      this.logger.log(
        `Firebase initialized successfully for project: ${projectId}`,
      );
    } catch (error) {
      this.logger.error('Failed to initialize Firebase', error);
      throw error;
    }
  }

  getAuth(): admin.auth.Auth {
    return this.auth;
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  /**
   * Convert Firestore Timestamps to JavaScript Dates
   */
  private convertTimestamps(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // Check if it's a Firestore Timestamp
    if (data instanceof admin.firestore.Timestamp) {
      return data.toDate();
    }

    // Check if it's a plain object with _seconds and _nanoseconds (serialized Timestamp)
    if (
      typeof data === 'object' &&
      '_seconds' in data &&
      '_nanoseconds' in data
    ) {
      return new admin.firestore.Timestamp(
        data._seconds,
        data._nanoseconds,
      ).toDate();
    }

    // Recursively convert arrays
    if (Array.isArray(data)) {
      return data.map((item) => this.convertTimestamps(item));
    }

    // Recursively convert objects
    if (typeof data === 'object' && data.constructor === Object) {
      const converted: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          converted[key] = this.convertTimestamps(data[key]);
        }
      }
      return converted;
    }

    return data;
  }

  /**
   * Get a document from Firestore
   */
  async getDocument<T>(path: string): Promise<T | null> {
    try {
      const doc = await this.firestore.doc(path).get();
      if (!doc.exists) {
        return null;
      }
      const data = { id: doc.id, ...doc.data() };
      return this.convertTimestamps(data) as T;
    } catch (error) {
      this.logger.error(`Error getting document at ${path}`, error);
      throw error;
    }
  }

  /**
   * Create a document in Firestore
   */
  async createDocument<T>(
    collectionPath: string,
    data: T,
    docId?: string,
  ): Promise<string> {
    try {
      if (docId) {
        await this.firestore
          .collection(collectionPath)
          .doc(docId)
          .set(data as any);
        return docId;
      } else {
        const docRef = await this.firestore
          .collection(collectionPath)
          .add(data as any);
        return docRef.id;
      }
    } catch (error) {
      this.logger.error(`Error creating document in ${collectionPath}`, error);
      throw error;
    }
  }

  /**
   * Update a document in Firestore
   */
  async updateDocument<T>(path: string, data: Partial<T>): Promise<void> {
    try {
      await this.firestore.doc(path).update(data);
    } catch (error) {
      this.logger.error(`Error updating document at ${path}`, error);
      throw error;
    }
  }

  /**
   * Delete a document from Firestore
   */
  async deleteDocument(path: string): Promise<void> {
    try {
      await this.firestore.doc(path).delete();
    } catch (error) {
      this.logger.error(`Error deleting document at ${path}`, error);
      throw error;
    }
  }

  /**
   * Query documents in a collection
   */
  async queryDocuments<T>(
    collectionPath: string,
    queryFn?: (query: admin.firestore.Query) => admin.firestore.Query,
  ): Promise<T[]> {
    try {
      let query: admin.firestore.Query =
        this.firestore.collection(collectionPath);

      if (queryFn) {
        query = queryFn(query);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => {
        const data = { id: doc.id, ...doc.data() };
        return this.convertTimestamps(data);
      }) as T[];
    } catch (error) {
      this.logger.error(`Error querying documents in ${collectionPath}`, error);
      throw error;
    }
  }

  /**
   * Set a document in Firestore (create or overwrite)
   */
  async setDocument<T>(path: string, data: T): Promise<void> {
    try {
      await this.firestore.doc(path).set(data as any);
    } catch (error) {
      this.logger.error(`Error setting document at ${path}`, error);
      throw error;
    }
  }

  /**
   * Verify Firebase ID token
   */
  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      return await this.auth.verifyIdToken(idToken);
    } catch (error) {
      this.logger.error('Error verifying ID token', error);
      throw error;
    }
  }

  /**
   * Get user by UID
   */
  async getUserByUid(uid: string): Promise<admin.auth.UserRecord> {
    try {
      return await this.auth.getUser(uid);
    } catch (error) {
      this.logger.error(`Error getting user ${uid}`, error);
      throw error;
    }
  }
}
