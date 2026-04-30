import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { FlowerRecord, User } from "../types";

function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate();
  if (val instanceof Date) return val;
  return new Date();
}

function docToRecord(id: string, data: Record<string, unknown>): FlowerRecord {
  return {
    id,
    userId: data.userId as string,
    photoLocalKey: data.photoLocalKey as string,
    flowerName: data.flowerName as string,
    flowerNameOriginal: data.flowerNameOriginal as string,
    candidates: (data.candidates as FlowerRecord["candidates"]) || [],
    confidence: data.confidence as number,
    capturedAt: toDate(data.capturedAt),
    location: (data.location as FlowerRecord["location"]) || null,
    isLocationRecorded: !!(data.isLocationRecorded || data.location),
  };
}

export async function saveRecord(
  record: Omit<FlowerRecord, "id">,
  recordId?: string
): Promise<string> {
  if (recordId) {
    const docRef = doc(db, "records", recordId);
    await setDoc(docRef, {
      ...record,
      capturedAt: serverTimestamp(),
    });
    return recordId;
  }
  const docRef = await addDoc(collection(db, "records"), {
    ...record,
    capturedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getRecordsByUser(
  userId: string
): Promise<FlowerRecord[]> {
  const q = query(
    collection(db, "records"),
    where("userId", "==", userId),
    orderBy("capturedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToRecord(d.id, d.data()));
}

export async function getRecordById(
  recordId: string
): Promise<FlowerRecord | null> {
  const snap = await getDoc(doc(db, "records", recordId));
  if (!snap.exists()) return null;
  return docToRecord(snap.id, snap.data());
}

export async function deleteRecord(recordId: string): Promise<void> {
  await deleteDoc(doc(db, "records", recordId));
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid,
    email: d.email,
    displayName: d.displayName,
    photoURL: d.photoURL,
    firstLoginAt: toDate(d.firstLoginAt),
    lastLoginAt: toDate(d.lastLoginAt),
    reviewedByAdmin: d.reviewedByAdmin,
    settings: d.settings || { locationDefaultOn: true },
  };
}

export async function updateUserSettings(
  uid: string,
  settings: Partial<User["settings"]>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    [`settings.locationDefaultOn`]: settings.locationDefaultOn,
  });
}

// --- Admin functions ---

export async function getAllUsers(): Promise<User[]> {
  const q = query(collection(db, "users"), orderBy("firstLoginAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: d.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      firstLoginAt: toDate(data.firstLoginAt),
      lastLoginAt: toDate(data.lastLoginAt),
      reviewedByAdmin: data.reviewedByAdmin,
      settings: data.settings || { locationDefaultOn: true },
    };
  });
}

export async function markUserReviewed(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), { reviewedByAdmin: true });
}

export async function blockUser(
  email: string,
  adminEmail: string,
  reason: string
): Promise<void> {
  const { setDoc: sd } = await import("firebase/firestore");
  await sd(doc(db, "blocked_users", email), {
    email,
    blockedAt: serverTimestamp(),
    blockedBy: adminEmail,
    reason,
  });
  await addDoc(collection(db, "admin_logs"), {
    action: "BLOCK_USER",
    targetEmail: email,
    performedBy: adminEmail,
    performedAt: serverTimestamp(),
  });
}

export async function unblockUser(
  email: string,
  adminEmail: string
): Promise<void> {
  await deleteDoc(doc(db, "blocked_users", email));
  await addDoc(collection(db, "admin_logs"), {
    action: "UNBLOCK_USER",
    targetEmail: email,
    performedBy: adminEmail,
    performedAt: serverTimestamp(),
  });
}

export async function getAllRecords(
  maxCount = 100
): Promise<FlowerRecord[]> {
  const q = query(
    collection(db, "records"),
    orderBy("capturedAt", "desc"),
    limit(maxCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToRecord(d.id, d.data()));
}
