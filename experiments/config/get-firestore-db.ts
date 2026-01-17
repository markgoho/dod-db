import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getFirebaseApp } from "../../src/config/get-firebase-app.js";

let firestore: Firestore | undefined;

export function getFirestoreDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getFirebaseApp());
  }
  return firestore;
}
