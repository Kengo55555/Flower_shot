import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getGlobalUsage } from "../../lib/usage-limit";
import type { User } from "../../types";
import { getAllUsers, markUserReviewed, blockUser, unblockUser } from "../../lib/firestore";
import { checkBlocked, getAllowedEmails, addAllowedEmail, removeAllowedEmail } from "../../lib/auth";
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

  // ホワイトリスト
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();

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

      const emails = await getAllowedEmails();
      setAllowedEmails(emails);
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

  const handleAddEmail = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      alert("正しいメールアドレスを入力してください");
      return;
    }
    if (allowedEmails.includes(email)) {
      alert("すでに登録済みです");
      return;
    }
    await addAllowedEmail(email);
    setNewEmail("");
    await loadData();
  };

  const handleRemoveEmail = async (email: string) => {
    if (email === ADMIN_EMAIL) {
      alert("管理者は削除できません");
      return;
    }
    await removeAllowedEmail(email);
    await loadData();
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">よみこみちゅう...</div>;
  }

  const unreviewedCount = users.filter((u) => !u.reviewedByAdmin).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-bold">管理者</h1>
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
          <p className="text-[10px] text-gray-500">撮影</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center shadow-sm">
          <p className="text-2xl font-bold">{todayApi}/500</p>
          <p className="text-[10px] text-gray-500">本日API</p>
        </div>
      </div>

      {/* 許可メールアドレス管理 */}
      <div className="px-4 mb-4">
        <h2 className="font-bold text-sm text-gray-600 mb-2">🔒 許可メールアドレス</h2>
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="flex gap-2 mb-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <button
              onClick={handleAddEmail}
              className="bg-green text-white px-4 py-2 rounded-lg text-sm font-bold flex-shrink-0"
            >
              追加
            </button>
          </div>
          <div className="space-y-2">
            {/* 管理者は常に表示（削除不可） */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm">{ADMIN_EMAIL}</span>
              <span className="text-[10px] text-gray-400">管理者</span>
            </div>
            {allowedEmails.map((email) => (
              <div key={email} className="flex items-center justify-between py-1">
                <span className="text-sm truncate flex-1">{email}</span>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  className="text-[10px] text-red-400 ml-2 flex-shrink-0"
                >
                  削除
                </button>
              </div>
            ))}
            {allowedEmails.length === 0 && (
              <p className="text-xs text-gray-400">管理者以外の許可ユーザーはいません</p>
            )}
          </div>
        </div>
      </div>

      {unreviewedCount > 0 && (
        <div className="mx-4 mb-3 bg-orange text-white rounded-xl p-3 text-sm text-center">
          未確認のユーザーが {unreviewedCount}人 います
        </div>
      )}

      {/* ユーザー一覧 */}
      <div className="px-4">
        <h2 className="font-bold text-sm text-gray-600 mb-2">登録者一覧</h2>
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
                    {u.firstLoginAt.toLocaleDateString("ja-JP")} 登録
                    ・{u.recordCount}枚
                    {u.isBlocked && <span className="text-red-400 ml-1">ブロック中</span>}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                {!u.reviewedByAdmin && (
                  <button
                    onClick={() => handleReview(u.uid)}
                    className="text-[10px] bg-green text-white px-3 py-1 rounded-full"
                  >
                    確認
                  </button>
                )}
                {u.isBlocked ? (
                  <button
                    onClick={() => handleUnblock(u.email)}
                    className="text-[10px] bg-gray-400 text-white px-3 py-1 rounded-full"
                  >
                    ブロック解除
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
