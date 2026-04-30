import type { FlowerRecord } from "../../types";

interface MonthlySummaryProps {
  records: FlowerRecord[];
}

export default function MonthlySummary({ records }: MonthlySummaryProps) {
  const now = new Date();
  const thisMonth = records.filter(
    (r) =>
      r.capturedAt.getMonth() === now.getMonth() &&
      r.capturedAt.getFullYear() === now.getFullYear()
  );
  const thisMonthUnique = new Set(thisMonth.map((r) => r.flowerNameOriginal))
    .size;
  const totalUnique = new Set(records.map((r) => r.flowerNameOriginal)).size;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-2">こんげつの きろく</p>
      <div className="flex justify-around text-center">
        <div>
          <p className="text-3xl font-bold text-pink">{thisMonthUnique}</p>
          <p className="text-xs text-gray-600 mt-1">しゅるい</p>
        </div>
        <div className="border-l border-gray-200" />
        <div>
          <p className="text-3xl font-bold text-green">{thisMonth.length}</p>
          <p className="text-xs text-gray-600 mt-1">かい さつえい</p>
        </div>
        <div className="border-l border-gray-200" />
        <div>
          <p className="text-3xl font-bold text-sky">{totalUnique}</p>
          <p className="text-xs text-gray-600 mt-1">ぜんぶの しゅるい</p>
        </div>
      </div>
    </div>
  );
}
