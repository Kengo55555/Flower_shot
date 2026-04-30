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
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

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
