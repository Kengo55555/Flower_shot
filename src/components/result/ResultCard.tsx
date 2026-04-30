interface ResultCardProps {
  flowerName: string;
  confidence: number;
  imageUrl: string;
}

export default function ResultCard({
  flowerName,
  confidence,
  imageUrl,
}: ResultCardProps) {
  const percent = Math.round(confidence * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-bounce-in">
      <img
        src={imageUrl}
        alt={flowerName}
        className="w-full h-56 object-cover"
      />
      <div className="p-5 text-center">
        <p className="text-3xl font-bold mb-2">{flowerName}</p>
        <p className="text-green font-bold text-lg">
          {percent}% の かくりつだよ
        </p>
      </div>
    </div>
  );
}
