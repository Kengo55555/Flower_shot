import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  collection,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { ADMIN_EMAIL } from "../constants";

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

export async function checkBlocked(email: string): Promise<boolean> {
  const docRef = doc(db, "blocked_users", email);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function checkAllowed(email: string): Promise<boolean> {
  // 管理者は常に許可
  if (email === ADMIN_EMAIL) return true;
  const docRef = doc(db, "allowed_emails", email);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function getAllowedEmails(): Promise<string[]> {
  const snap = await getDocs(collection(db, "allowed_emails"));
  return snap.docs.map((d) => d.id);
}

export async function addAllowedEmail(email: string): Promise<void> {
  await setDoc(doc(db, "allowed_emails", email), {
    email,
    addedAt: serverTimestamp(),
    addedBy: ADMIN_EMAIL,
  });
}

export async function removeAllowedEmail(email: string): Promise<void> {
  await deleteDoc(doc(db, "allowed_emails", email));
}

export async function registerOrUpdateUser(
  user: FirebaseUser
): Promise<void> {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      firstLoginAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      reviewedByAdmin: false,
      settings: { locationDefaultOn: true },
    });
  } else {
    await updateDoc(userRef, { lastLoginAt: serverTimestamp() });
  }
}
