import { initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let firestore: Firestore | undefined;

export function getFirebaseApp(): App {
  if (!app) {
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  return app;
}

export function getFirestoreDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}
