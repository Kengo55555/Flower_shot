import { useMemo } from "react";
import { getUniquePrefectures } from "../../lib/prefecture";
import type { FlowerRecord } from "../../types";

interface SummaryProps {
  records: FlowerRecord[];
}

export default function MonthlySummary({ records }: SummaryProps) {
  const totalUnique = new Set(records.map((r) => r.flowerNameOriginal)).size;
  const prefectures = useMemo(() => getUniquePrefectures(records), [records]);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-sm text-gray-500 mb-2">これまでの きろく</p>
      <div className="flex justify-around text-center">
        <div>
          <p className="text-3xl font-bold text-pink">{totalUnique}</p>
          <p className="text-xs text-gray-600 mt-1">しゅるい</p>
        </div>
        <div className="border-l border-gray-200" />
        <div>
          <p className="text-3xl font-bold text-green">{records.length}</p>
          <p className="text-xs text-gray-600 mt-1">まい</p>
        </div>
        <div className="border-l border-gray-200" />
        <div>
          <p className="text-3xl font-bold text-sky">{prefectures.length}</p>
          <p className="text-xs text-gray-600 mt-1">とどうふけん</p>
          {prefectures.length > 0 && (
            <p className="text-[9px] text-gray-400 mt-1 leading-tight">
              {prefectures.join("・")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
