import { useState, useEffect } from "react";

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "おはなを しらべているよ..." }: LoadingProps) {
  const [longWait, setLongWait] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLongWait(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-6xl animate-spin-flower mb-6">🌸</div>
      <p className="text-lg font-bold animate-float">
        {longWait ? "もうすこし まってね..." : message}
      </p>
    </div>
  );
}
