import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import CaptureButton from "../components/camera/CaptureButton";
import LocationPicker from "../components/map/LocationPicker";
import { useCapture } from "../hooks/useCapture";
import { useAuth } from "../hooks/useAuth";
import { getCurrentLocation } from "../lib/geolocation";
import { compressImage } from "../lib/image-utils";
import type { GeoLocation } from "../types";

export default function CameraPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { imagePreviewUrl, setCaptureData, clearCaptureData } = useCapture();
  const [locationOn, setLocationOn] = useState(
    user?.settings.locationDefaultOn ?? true
  );
  const [pickedLocation, setPickedLocation] = useState<GeoLocation | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
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

  const handleAutoLocation = async () => {
    setGettingLocation(true);
    const loc = await getCurrentLocation();
    setGettingLocation(false);
    if (loc) {
      setPickedLocation(loc);
    } else {
      alert("いちじょうほうが とれなかったよ。ちずから えらんでね");
      setShowMapPicker(true);
    }
  };

  const handleProceed = async () => {
    if (!navigator.onLine) {
      alert("でんぱの あるところで もういちど ためしてね");
      return;
    }

    if (locationOn && !pickedLocation) {
      setGettingLocation(true);
      const loc = await getCurrentLocation();
      setGettingLocation(false);
      if (loc) {
        setCaptureData({ location: loc, isLocationRecorded: true });
      } else {
        setCaptureData({ location: null, isLocationRecorded: false });
      }
    } else if (locationOn && pickedLocation) {
      setCaptureData({ location: pickedLocation, isLocationRecorded: true });
    } else {
      setCaptureData({ location: null, isLocationRecorded: false });
    }
    setTimeout(() => navigate("/result"), 50);
  };

  const handleRetake = () => {
    setPickedLocation(null);
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

            {/* 位置情報ON/OFF */}
            <div className="flex items-center justify-between bg-white rounded-xl p-4 mb-3">
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

            {/* 位置情報選択ボタン */}
            {locationOn && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handleAutoLocation}
                  disabled={gettingLocation}
                  className="flex-1 bg-white rounded-xl p-3 text-sm font-bold text-center shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {gettingLocation ? "とっているよ..." : pickedLocation ? "📍 GPS で とりなおす" : "📍 いまの ばしょ"}
                </button>
                <button
                  onClick={() => setShowMapPicker(true)}
                  className="flex-1 bg-white rounded-xl p-3 text-sm font-bold text-center shadow-sm active:scale-95"
                >
                  🗺️ ちずで えらぶ
                </button>
              </div>
            )}

            {/* 選択済み位置情報の表示 */}
            {locationOn && pickedLocation && (
              <p className="text-xs text-green text-center mb-3">
                ✅ ばしょを せっていしたよ
              </p>
            )}

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
                この しゃしんで しらべる
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

      {showMapPicker && (
        <LocationPicker
          initialLocation={pickedLocation}
          onSelect={(loc) => {
            setPickedLocation(loc);
            setShowMapPicker(false);
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
}
