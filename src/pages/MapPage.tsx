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
  const [selectedMonth, setSelectedMonth] = useState(0);

  const filteredRecords = useMemo(() => {
    const withLocation = records.filter((r) => r.location !== null && r.location !== undefined);
    if (selectedMonth === 0) return withLocation;
    return withLocation.filter(
      (r) => r.capturedAt.getMonth() + 1 === selectedMonth
    );
  }, [records, selectedMonth]);

  if (isLoading) {
    return <Loading message="ちずを よみこんでいるよ..." />;
  }

  return (
    <div className="flex flex-col h-[100dvh] pb-16 overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-center mb-2">🗺️ おはな ちず</h1>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MONTHS.map((label, i) => (
            <button
              key={i}
              onClick={() => setSelectedMonth(i)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
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

      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        {filteredRecords.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500 text-center">
              ばしょつきの きろくが まだないよ
            </p>
          </div>
        ) : (
          <div className="absolute inset-0">
            <FlowerMap records={filteredRecords} />
          </div>
        )}
      </div>
    </div>
  );
}
