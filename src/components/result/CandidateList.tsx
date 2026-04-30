import type { Candidate } from "../../types";

interface CandidateListProps {
  candidates: Candidate[];
  imageUrl: string;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export default function CandidateList({
  candidates,
  imageUrl,
  selectedIndex,
  onSelect,
}: CandidateListProps) {
  return (
    <div className="animate-bounce-in">
      <img
        src={imageUrl}
        alt="さつえいした しゃしん"
        className="w-full h-44 object-cover rounded-2xl mb-4"
      />
      <p className="text-xl font-bold text-center mb-4">
        この おはなかも？
      </p>
      <div className="space-y-3">
        {candidates.map((c, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-full p-4 rounded-xl text-left flex justify-between items-center transition-colors ${
              selectedIndex === i
                ? "bg-pink-light border-2 border-pink"
                : "bg-white border-2 border-gray-200"
            }`}
          >
            <div>
              <span className="text-lg font-bold block">{c.name}</span>
              <span className="text-xs text-gray-400 italic">{c.nameOriginal}</span>
            </div>
            <span className="text-sm text-gray-600 flex-shrink-0">
              {Math.round(c.confidence * 100)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
