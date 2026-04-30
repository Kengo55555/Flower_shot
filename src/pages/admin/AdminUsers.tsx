import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, markUserReviewed, blockUser, unblockUser } from "../../lib/firestore";
import { checkBlocked } from "../../lib/auth";
import { ADMIN_EMAIL } from "../../constants";
import type { User } from "../../types";

interface UserWithStatus extends User {
  isBlocked: boolean;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserWithStatus[]>([]);
  const [filter, setFilter] = useState<"all" | "unreviewed" | "blocked">("all");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const allUsers = await getAllUsers();
      const withStatus = await Promise.all(
        allUsers.map(async (u) => ({
          ...u,
          isBlocked: await checkBlocked(u.email),
        }))
      );
      setUsers(withStatus);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter((u) => {
    if (filter === "unreviewed") return !u.reviewedByAdmin;
    if (filter === "blocked") return u.isBlocked;
    return true;
  });

  const handleReview = async (uid: string) => {
    await markUserReviewed(uid);
    await loadUsers();
  };

  const handleBlock = async (email: string) => {
    const reason = prompt("ブロック理由（任意）:") ?? "";
    await blockUser(email, ADMIN_EMAIL, reason);
    await loadUsers();
  };

  const handleUnblock = async (email: string) => {
    await unblockUser(email, ADMIN_EMAIL);
    await loadUsers();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">ユーザー一覧</h1>
        <button
          onClick={() => navigate("/admin")}
          className="text-sm text-blue-500 underline"
        >
          戻る
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "unreviewed", "blocked"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm ${
              filter === f
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {f === "all" ? "すべて" : f === "unreviewed" ? "未確認" : "ブロック中"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div
              key={u.uid}
              className={`bg-white rounded-xl p-4 shadow-sm ${
                !u.reviewedByAdmin ? "border-l-4 border-orange" : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">{u.displayName}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    初回: {u.firstLoginAt.toLocaleDateString("ja-JP")} / 最終:{" "}
                    {u.lastLoginAt.toLocaleDateString("ja-JP")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!u.reviewedByAdmin && (
                    <button
                      onClick={() => handleReview(u.uid)}
                      className="text-xs bg-green text-white px-3 py-1 rounded-full"
                    >
                      確認済み
                    </button>
                  )}
                  {u.isBlocked ? (
                    <button
                      onClick={() => handleUnblock(u.email)}
                      className="text-xs bg-gray-400 text-white px-3 py-1 rounded-full"
                    >
                      解除
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBlock(u.email)}
                      className="text-xs bg-red-400 text-white px-3 py-1 rounded-full"
                    >
                      ブロック
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
