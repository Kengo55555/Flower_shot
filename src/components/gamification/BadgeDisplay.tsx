import { BADGES } from "../../constants";

interface BadgeDisplayProps {
  totalUniqueCount: number;
}

export default function BadgeDisplay({ totalUniqueCount }: BadgeDisplayProps) {
  return (
    <div className="flex gap-3 overflow-x-auto py-2 px-1">
      {BADGES.map((badge) => {
        const earned = totalUniqueCount >= badge.requiredCount;
        return (
          <div
            key={badge.id}
            className={`flex-shrink-0 w-20 text-center ${
              earned ? "" : "opacity-40 grayscale"
            }`}
          >
            <div className="text-4xl mb-1">{badge.icon}</div>
            <p className="text-[10px] font-bold leading-tight">{badge.name}</p>
            {!earned && (
              <p className="text-[9px] text-gray-500 mt-0.5">
                あと{badge.requiredCount - totalUniqueCount}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
