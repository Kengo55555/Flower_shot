import { doc, getDoc, setDoc, increment } from "firebase/firestore";
import { db } from "./firebase";
import { DAILY_USER_LIMIT, DAILY_GLOBAL_LIMIT } from "../constants";

function getJstDateString(): string {
  const now = new Date();
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

export async function getUserUsage(userId: string): Promise<number> {
  const date = getJstDateString();
  const docRef = doc(db, "apiUsage", `user_${userId}_${date}`);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data().count as number) : 0;
}

export async function getGlobalUsage(): Promise<number> {
  const date = getJstDateString();
  const docRef = doc(db, "apiUsage", `global_${date}`);
  const snap = await getDoc(docRef);
  return snap.exists() ? (snap.data().count as number) : 0;
}

export interface UsageCheckResult {
  canUse: boolean;
  userCount: number;
  globalCount: number;
  userRemaining: number;
  reason: "ok" | "user_limit" | "global_limit";
}

export async function checkCanUse(
  userId: string
): Promise<UsageCheckResult> {
  const [userCount, globalCount] = await Promise.all([
    getUserUsage(userId),
    getGlobalUsage(),
  ]);

  if (globalCount >= DAILY_GLOBAL_LIMIT) {
    return {
      canUse: false,
      userCount,
      globalCount,
      userRemaining: 0,
      reason: "global_limit",
    };
  }
  if (userCount >= DAILY_USER_LIMIT) {
    return {
      canUse: false,
      userCount,
      globalCount,
      userRemaining: 0,
      reason: "user_limit",
    };
  }
  return {
    canUse: true,
    userCount,
    globalCount,
    userRemaining: DAILY_USER_LIMIT - userCount,
    reason: "ok",
  };
}

export async function incrementUsage(userId: string): Promise<void> {
  const date = getJstDateString();

  const userRef = doc(db, "apiUsage", `user_${userId}_${date}`);
  await setDoc(
    userRef,
    { userId, date, count: increment(1) },
    { merge: true }
  );

  const globalRef = doc(db, "apiUsage", `global_${date}`);
  await setDoc(
    globalRef,
    { date, count: increment(1) },
    { merge: true }
  );
}
