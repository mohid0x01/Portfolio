/**
 * Firebase stub — Firebase has been removed from this project.
 * The app uses Lovable Cloud (Supabase) for all backend functionality.
 * These exports are kept as no-ops to avoid breaking any legacy references.
 */

export async function initFirebase() {
  return { app: null, auth: null, db: null, storage: null };
}

export async function signIn(_email: string, _password: string): Promise<never> {
  throw new Error("Firebase not configured. Use Supabase auth.");
}

export async function signOut(): Promise<void> {
  // no-op
}

export async function onAuthChange(
  callback: (user: null) => void
): Promise<() => void> {
  callback(null);
  return () => {};
}

export async function getCollection(_collectionName: string) {
  return null;
}

export async function addDocument(_collectionName: string, _data: object) {
  throw new Error("Firebase not configured.");
}

export async function updateDocument(
  _collectionName: string,
  _docId: string,
  _data: object
) {
  throw new Error("Firebase not configured.");
}

export async function deleteDocument(_collectionName: string, _docId: string) {
  throw new Error("Firebase not configured.");
}
