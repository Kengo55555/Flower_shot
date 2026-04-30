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
  const urlRef = useRef<string | null>(null);

  useEffect(() => {
    const key = record.photoLocalKey || record.id;
    getImage(key).then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        urlRef.current = url;
        setImageUrl(url);
      }
    });
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, [record.photoLocalKey, record.id]);

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
          <span className="text-4xl">🌸</span>
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-base truncate">{record.flowerName}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDate(record.capturedAt)}
        </p>
        {record.location ? (
          <p className="text-xs text-green mt-0.5">📍 ばしょあり</p>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">ばしょなし</p>
        )}
      </div>
    </button>
  );
}
