import { useState, useMemo } from "react";
import FlowerMap from "../components/map/FlowerMap";
import Loading from "../components/common/Loading";
import { useRecords } from "../hooks/useRecords";

const MONTHS = [
  "ぜんぶ",
  "1がつ", "2がつ", "3がつ", "4がつ", "5がつ", "6がつ",
  "7がつ", "8がつ", "9がつ", "10がつ", "11がつ", "12がつ",
];

export default function MapPage() {
  const { records, isLoading } = useRecords();
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = all

  const filteredRecords = useMemo(() => {
    const withLocation = records.filter((r) => r.isLocationRecorded && r.location);
    if (selectedMonth === 0) return withLocation;
    return withLocation.filter(
      (r) => r.capturedAt.getMonth() + 1 === selectedMonth
    );
  }, [records, selectedMonth]);

  if (isLoading) {
    return <Loading message="ちずを よみこんでいるよ..." />;
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-2xl font-bold text-center mb-3">🗺️ おはな ちず</h1>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {MONTHS.map((label, i) => (
            <button
              key={i}
              onClick={() => setSelectedMonth(i)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                selectedMonth === i
                  ? "bg-pink text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 relative" style={{ minHeight: "400px" }}>
        {filteredRecords.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-center">
              ばしょつきの きろくが まだないよ
            </p>
          </div>
        ) : (
          <FlowerMap records={filteredRecords} />
        )}
      </div>
    </div>
  );
}
