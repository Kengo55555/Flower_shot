import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { getGlobalUsage } from "../../lib/usage-limit";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [unreviewed, setUnreviewed] = useState(0);
  const [todayApi, setTodayApi] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const unreviewedQ = query(
          collection(db, "users"),
          where("reviewedByAdmin", "==", false)
        );
        const unreviewedSnap = await getDocs(unreviewedQ);
        setUnreviewed(unreviewedSnap.size);

        const allUsersSnap = await getDocs(collection(db, "users"));
        setTotalUsers(allUsersSnap.size);

        const globalUsage = await getGlobalUsage();
        setTodayApi(globalUsage);
      } catch (err) {
        console.error("Admin dashboard error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">読み込み中...</div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">管理者ダッシュボード</h1>
        <button
          onClick={() => navigate("/")}
          className="text-sm text-blue-500 underline"
        >
          アプリに戻る
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className={`bg-white rounded-xl p-4 shadow-sm ${
            unreviewed > 0 ? "border-2 border-orange" : ""
          }`}
        >
          <p className="text-sm text-gray-500">未確認ユーザー</p>
          <p className="text-3xl font-bold">{unreviewed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">本日のAPI使用量</p>
          <p className="text-3xl font-bold">{todayApi}/500</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">総ユーザー数</p>
          <p className="text-3xl font-bold">{totalUsers}</p>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigate("/admin/users")}
          className="w-full bg-white rounded-xl p-4 shadow-sm text-left font-bold"
        >
          ユーザー一覧 →
        </button>
        <button
          onClick={() => navigate("/admin/records")}
          className="w-full bg-white rounded-xl p-4 shadow-sm text-left font-bold"
        >
          撮影記録一覧 →
        </button>
      </div>
    </div>
  );
}
