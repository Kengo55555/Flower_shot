import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import CaptureButton from "../components/camera/CaptureButton";
import { useCapture } from "../hooks/useCapture";
import { compressImage } from "../lib/image-utils";

export default function CameraPage() {
  const navigate = useNavigate();
  const { imagePreviewUrl, setCaptureData, clearCaptureData } = useCapture();
  const [processing, setProcessing] = useState(false);

  const handleCapture = async (file: File) => {
    setProcessing(true);
    const blob = await compressImage(file);
    const previewUrl = URL.createObjectURL(blob);
    setCaptureData({
      imageFile: file,
      compressedBlob: blob,
      imagePreviewUrl: previewUrl,
    });
    setProcessing(false);
  };

  const handleProceed = () => {
    if (!navigator.onLine) {
      alert("でんぱの あるところで もういちど ためしてね");
      return;
    }
    navigate("/result");
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="おはなを さつえいしよう！" onBack={() => navigate("/")} />

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
        {imagePreviewUrl ? (
          <div className="w-full">
            <img
              src={imagePreviewUrl}
              alt="さつえいした しゃしん"
              className="w-full h-64 object-cover rounded-2xl mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={() => clearCaptureData()}
                className="flex-1 bg-gray-200 rounded-full py-3 font-bold text-base"
              >
                とりなおす
              </button>
              <button
                onClick={handleProceed}
                className="flex-1 bg-pink text-white rounded-full py-3 font-bold text-base"
              >
                この しゃしんで しらべる
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-6xl mb-6">🌷</p>
            <p className="text-lg mb-8">おはなの しゃしんを とろう！</p>
            <CaptureButton onCapture={handleCapture} disabled={processing} />
            {processing && <p className="text-sm text-gray-400 mt-3">じゅんびちゅう...</p>}
          </div>
        )}
      </div>
    </div>
  );
}
