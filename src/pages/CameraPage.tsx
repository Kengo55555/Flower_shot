import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import CaptureButton from "../components/camera/CaptureButton";
import { useCapture } from "../hooks/useCapture";
import { useAuth } from "../hooks/useAuth";
import { getCurrentLocation } from "../lib/geolocation";
import { compressImage } from "../lib/image-utils";

export default function CameraPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { imagePreviewUrl, setCaptureData, clearCaptureData } = useCapture();
  const [locationOn, setLocationOn] = useState(
    user?.settings.locationDefaultOn ?? true
  );
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleCapture = async (file: File) => {
    const blob = await compressImage(file);
    const previewUrl = URL.createObjectURL(blob);
    setCaptureData({
      imageFile: file,
      compressedBlob: blob,
      imagePreviewUrl: previewUrl,
    });
  };

  const handleProceed = async () => {
    if (!navigator.onLine) {
      alert("でんぱの あるところで もういちど ためしてね");
      return;
    }

    if (locationOn) {
      setGettingLocation(true);
      const loc = await getCurrentLocation();
      setGettingLocation(false);
      if (loc) {
        setCaptureData({ location: loc, isLocationRecorded: true });
      } else {
        setCaptureData({ location: null, isLocationRecorded: false });
      }
    } else {
      setCaptureData({ location: null, isLocationRecorded: false });
    }
    navigate("/result");
  };

  const handleRetake = () => {
    clearCaptureData();
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
              className="w-full h-64 object-cover rounded-2xl mb-4"
            />

            <div className="flex items-center justify-between bg-white rounded-xl p-4 mb-4">
              <span className="text-base">ばしょを きろくする</span>
              <button
                onClick={() => setLocationOn(!locationOn)}
                className={`w-14 h-8 rounded-full transition-colors ${
                  locationOn ? "bg-green" : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform ${
                    locationOn ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="flex-1 bg-gray-200 rounded-full py-3 font-bold text-base"
              >
                とりなおす
              </button>
              <button
                onClick={handleProceed}
                disabled={gettingLocation}
                className="flex-1 bg-pink text-white rounded-full py-3 font-bold text-base disabled:opacity-50"
              >
                {gettingLocation ? "ばしょを とっているよ..." : "この しゃしんで しらべる"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-6xl mb-6">🌷</p>
            <p className="text-lg mb-8">おはなの しゃしんを とろう！</p>
            <CaptureButton onCapture={handleCapture} />
          </div>
        )}
      </div>
    </div>
  );
}
