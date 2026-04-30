import { useState, useMemo } from "react";
import FlowerMap from "../components/map/FlowerMap";
import Loading from "../components/common/Loading";
import { useRecords } from "../hooks/useRecords";

export default function MapPage() {
  const { records, isLoading } = useRecords();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const withLocation = useMemo(
    () => records.filter((r) => r.location !== null && r.location !== undefined),
    [records]
  );

  const years = useMemo(() => {
    const set = new Set(withLocation.map((r) => r.capturedAt.getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [withLocation]);

  const filteredRecords = useMemo(() => {
    if (selectedYear === null) return withLocation;
    return withLocation.filter((r) => r.capturedAt.getFullYear() === selectedYear);
  }, [withLocation, selectedYear]);

  if (isLoading) {
    return <Loading message="ちずを よみこんでいるよ..." />;
  }

  return (
    <div className="flex flex-col h-[100dvh] pb-16 overflow-hidden">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-bold text-center mb-2">🗺️ おはな ちず</h1>
        {years.length > 0 && (
          <div className="flex gap-2 justify-center pb-1">
            <button
              onClick={() => setSelectedYear(null)}
              className={`px-3 py-1 rounded-full text-xs font-bold ${
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
                className={`px-3 py-1 rounded-full text-xs font-bold ${
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
