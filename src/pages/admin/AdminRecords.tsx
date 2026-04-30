import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllRecords } from "../../lib/firestore";
import type { FlowerRecord } from "../../types";

export default function AdminRecords() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<FlowerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAllRecords(200);
        setRecords(data);
      } catch (err) {
        console.error("Failed to load records:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">撮影記録一覧</h1>
        <button
          onClick={() => navigate("/admin")}
          className="text-sm text-blue-500 underline"
        >
          戻る
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">読み込み中...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500">記録がありません</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl shadow-sm text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left">花の名前</th>
                <th className="p-3 text-left">信頼度</th>
                <th className="p-3 text-left">日時</th>
                <th className="p-3 text-left">場所</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3 font-bold">{r.flowerName}</td>
                  <td className="p-3">
                    {Math.round(r.confidence * 100)}%
                  </td>
                  <td className="p-3 text-gray-500">
                    {r.capturedAt.toLocaleDateString("ja-JP")}
                  </td>
                  <td className="p-3">
                    {r.isLocationRecorded ? "あり" : "なし"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
