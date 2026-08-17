import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0913562980";
const databaseId = process.env.FIREBASE_DATABASE_ID || "ai-studio-aeb12e28-f43d-4581-944f-d1882551d84e";

function readServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;

  try {
    const value = raw.trim().startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(value);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON no contiene JSON o base64 válido.");
  }
}

function getAdminApp() {
  if (getApps().length) return getApps()[0];

  const serviceAccount = readServiceAccount();
  return initializeApp({
    projectId,
    credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
  });
}

export const adminDb = getFirestore(getAdminApp(), databaseId);
export { FieldValue, Timestamp };
