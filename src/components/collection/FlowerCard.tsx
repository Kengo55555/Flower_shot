import { useState, useEffect, useRef } from "react";
import { getImage } from "../../lib/indexeddb";
import type { FlowerRecord } from "../../types";

interface FlowerCardProps {
  record: FlowerRecord;
  onClick: () => void;
}

function formatDate(date: Date): string {
  return `${date.getMonth() + 1}がつ ${date.getDate()}にち`;
}

export default function FlowerCard({ record, onClick }: FlowerCardProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageChecked, setImageChecked] = useState(false);
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    const key = record.photoLocalKey || record.id;
    getImage(key).then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setImageUrl(url);
      }
      setImageChecked(true);
    }).catch(() => {
      setImageChecked(true);
    });
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [record.photoLocalKey, record.id]);

  const pct = Math.round(record.confidence * 100);

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm overflow-hidden text-left w-full active:scale-[0.98] transition-transform"
    >
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={record.flowerName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center">
            <span className="text-4xl mb-2">🌻</span>
            <p className="text-sm font-bold leading-tight">{record.flowerName}</p>
            <p className="text-[10px] text-gray-400 italic mt-1">{record.flowerNameOriginal}</p>
            {imageChecked && (
              <p className="text-[9px] text-gray-300 mt-2">📷 しゃしんなし</p>
            )}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-base truncate">{record.flowerName}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">{formatDate(record.capturedAt)}</p>
          <p className="text-xs text-gray-400">{pct}%</p>
        </div>
        {record.location ? (
          <p className="text-xs text-green mt-0.5">📍 ばしょあり</p>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">ばしょなし</p>
        )}
      </div>
    </button>
  );
}
