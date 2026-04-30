import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getGlobalUsage } from "../../lib/usage-limit";
import type { User } from "../../types";
import { getAllUsers, markUserReviewed, blockUser, unblockUser } from "../../lib/firestore";
import { checkBlocked } from "../../lib/auth";
import { ADMIN_EMAIL } from "../../constants";

interface UserWithStatus extends User {
  isBlocked: boolean;
  recordCount: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [todayApi, setTodayApi] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();

      // 各ユーザーのブロック状態とレコード数を取得
      const recordsSnap = await getDocs(collection(db, "records"));
      const recordsByUser: Record<string, number> = {};
      recordsSnap.forEach((doc) => {
        const uid = doc.data().userId as string;
        recordsByUser[uid] = (recordsByUser[uid] || 0) + 1;
      });
      setTotalRecords(recordsSnap.size);

      const withStatus = await Promise.all(
        allUsers.map(async (u) => ({
          ...u,
          isBlocked: await checkBlocked(u.email),
          recordCount: recordsByUser[u.uid] || 0,
        }))
      );
      setUsers(withStatus);

      const globalUsage = await getGlobalUsage();
      setTodayApi(globalUsage);
    } catch (err) {
      console.error("Admin error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (uid: string) => {
    await markUserReviewed(uid);
    await loadData();
  };

  const handleBlock = async (email: string) => {
    await blockUser(email, ADMIN_EMAIL, "");
    await loadData();
  };

  const handleUnblock = async (email: string) => {
    await unblockUser(email, ADMIN_EMAIL);
    await loadData();
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">よみこみちゅう...</div>;
  }

  const unreviewedCount = users.filter((u) => !u.reviewedByAdmin).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold">かんりしゃ</h1>
        <button onClick={() => navigate("/settings")} className="text-sm underline">
          もどる
        </button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-2 p-4">
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-[10px] text-gray-500">ユーザー</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold">{totalRecords}</p>
          <p className="text-[10px] text-gray-500">さつえい</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold">{todayApi}/500</p>
          <p className="text-[10px] text-gray-500">きょうのAPI</p>
        </div>
      </div>

      {unreviewedCount > 0 && (
        <div className="mx-4 mb-3 bg-orange text-white rounded-xl p-3 text-sm text-center">
          みかくにんの ユーザーが {unreviewedCount}にん います
        </div>
      )}

      {/* ユーザー一覧 */}
      <div className="px-4">
        <h2 className="font-bold text-sm text-gray-600 mb-2">とうろくしゃ いちらん</h2>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.uid}
              className={`bg-white rounded-xl p-3 shadow-sm ${
                !u.reviewedByAdmin ? "border-l-4 border-orange" : ""
              } ${u.isBlocked ? "opacity-50" : ""}`}
            >
              <div className="flex items-center gap-3">
                {u.photoURL && (
                  <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{u.displayName}</p>
                  <p className="text-[10px] text-gray-500 truncate">{u.email}</p>
                  <p className="text-[10px] text-gray-400">
                    {u.firstLoginAt.toLocaleDateString("ja-JP")} とうろく
                    ・{u.recordCount}まい
                    {u.isBlocked && <span className="text-red-400 ml-1">ブロックちゅう</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                {!u.reviewedByAdmin && (
                  <button
                    onClick={() => handleReview(u.uid)}
                    className="text-[10px] bg-green text-white px-3 py-1 rounded-full"
                  >
                    かくにん
                  </button>
                )}
                {u.isBlocked ? (
                  <button
                    onClick={() => handleUnblock(u.email)}
                    className="text-[10px] bg-gray-400 text-white px-3 py-1 rounded-full"
                  >
                    ブロックかいじょ
                  </button>
                ) : (
                  <button
                    onClick={() => handleBlock(u.email)}
                    className="text-[10px] bg-red-400 text-white px-3 py-1 rounded-full"
                  >
                    ブロック
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
