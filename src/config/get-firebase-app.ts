import { initializeApp, type App } from "firebase-admin/app";

let app: App | undefined;

export function getFirebaseApp(): App {
  if (!app) {
    app = initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  return app;
}
