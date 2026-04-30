import { useRef } from "react";

interface CaptureButtonProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

export default function CaptureButton({ onCapture, disabled }: CaptureButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={handleClick}
        disabled={disabled}
        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-white text-lg font-bold shadow-lg transition-transform active:scale-95 ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-pink hover:bg-pink-light"
        }`}
      >
        <span className="text-3xl">📷</span>
        <span className="text-xs mt-1">さつえい</span>
      </button>
    </>
  );
}
