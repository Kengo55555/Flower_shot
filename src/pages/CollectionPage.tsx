import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FlowerCard from "../components/collection/FlowerCard";
import Loading from "../components/common/Loading";
import { useRecords } from "../hooks/useRecords";

export default function CollectionPage() {
  const navigate = useNavigate();
  const { records, isLoading } = useRecords();

  const years = useMemo(() => {
    const set = new Set(records.map((r) => r.capturedAt.getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [records]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (selectedYear === null) return records;
    return records.filter((r) => r.capturedAt.getFullYear() === selectedYear);
  }, [records, selectedYear]);

  const uniqueCount = new Set(filtered.map((r) => r.flowerNameOriginal)).size;

  if (isLoading) {
    return <Loading message="ずかんを よみこんでいるよ..." />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-center mb-1">📖 ずかん</h1>
        {records.length > 0 && (
          <p className="text-center text-sm text-gray-500">
            ぜんぶで <span className="font-bold text-pink">{uniqueCount}しゅるい</span>{" "}
            みつけたよ！
          </p>
        )}

        {years.length > 0 && (
          <div className="flex gap-2 justify-center mt-3">
            <button
              onClick={() => setSelectedYear(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                selectedYear === null
                  ? "bg-pink text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              ぜんぶ
            </button>
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                  selectedYear === y
                    ? "bg-pink text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {y}ねん
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className="text-5xl mb-4">🌱</p>
          <p className="text-lg text-center">
            まだ おはなを みつけていないよ。さつえいしに いこう！
          </p>
          <button
            onClick={() => navigate("/camera")}
            className="mt-6 bg-pink text-white rounded-full px-8 py-3 font-bold"
          >
            さつえいする
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4">
          {filtered.map((record) => (
            <FlowerCard
              key={record.id}
              record={record}
              onClick={() => navigate(`/detail/${record.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
