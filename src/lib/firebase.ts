import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Check if Firebase has been configured with valid credentials
export const isFirebaseEnabled = 
  Boolean(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "");

let app;
let auth: any = null;
let db: any = null;

if (isFirebaseEnabled) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    // As per skill guidelines: export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
  } catch (error) {
    console.error("Failed to initialize Firebase SDK:", error);
  }
}

export { auth, db };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid || null,
      email: currentUser?.email || null,
      emailVerified: currentUser?.emailVerified || null,
      isAnonymous: currentUser?.isAnonymous || null,
      tenantId: currentUser?.tenantId || null,
      providerInfo: currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error Detailed Payload:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Google Sign In Popup Helper
export async function signInWithGoogle(): Promise<User | null> {
  if (!isFirebaseEnabled || !auth) {
    throw new Error("Firebase has not been fully configured yet with credentials.");
  }
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Authentication failed:", error);
    throw error;
  }
}

// Sign Out Helper
export async function signOutUser(): Promise<void> {
  if (!isFirebaseEnabled || !auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign Out failed:", error);
    throw error;
  }
}
