import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CaptureButton from "../components/camera/CaptureButton";
import MonthlySummary from "../components/gamification/MonthlySummary";
import BadgeDisplay from "../components/gamification/BadgeDisplay";
import PwaInstallBanner from "../components/common/PwaInstallBanner";
import { useRecords } from "../hooks/useRecords";
import { useUsageLimit } from "../hooks/useUsageLimit";
import { useCapture } from "../hooks/useCapture";
import { compressImage } from "../lib/image-utils";

export default function HomePage() {
  const navigate = useNavigate();
  const { records, isLoading } = useRecords();
  const { userRemaining, canUse } = useUsageLimit();
  const { setCaptureData } = useCapture();
  const [safetyShown, setSafetyShown] = useState(false);

  const totalUnique = new Set(records.map((r) => r.flowerNameOriginal)).size;

  useEffect(() => {
    if (!localStorage.getItem("flower_shot_safety_shown")) {
      setSafetyShown(true);
    }
  }, []);

  const handleSafetyDismiss = () => {
    localStorage.setItem("flower_shot_safety_shown", "true");
    setSafetyShown(false);
  };

  const handleCapture = async (file: File) => {
    const blob = await compressImage(file);
    const previewUrl = URL.createObjectURL(blob);
    setCaptureData({
      imageFile: file,
      compressedBlob: blob,
      imagePreviewUrl: previewUrl,
    });
    navigate("/camera");
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <PwaInstallBanner />

      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-center mb-1">🌸 Flower Shot</h1>
        <p className="text-center text-sm text-gray-500 mb-5">
          おはなの なまえを しらべよう！
        </p>

        {!isLoading && records.length > 0 && (
          <>
            <MonthlySummary records={records} />
            <div className="mt-4">
              <BadgeDisplay totalUniqueCount={totalUnique} />
            </div>
          </>
        )}

        {userRemaining <= 10 && userRemaining > 0 && (
          <div className="bg-yellow rounded-xl p-3 mt-4 text-center text-sm">
            きょうは あと <span className="font-bold">{userRemaining}かい</span>{" "}
            あそべるよ
          </div>
        )}

        {!canUse && (
          <div className="bg-gray-200 rounded-xl p-3 mt-4 text-center text-sm">
            きょうの おはなさがしは おしまい！あしたまた あそぼうね
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <CaptureButton onCapture={handleCapture} disabled={!canUse} />
        {canUse && (
          <p className="text-sm text-gray-400 mt-3">
            おはなを さつえいしよう！
          </p>
        )}
      </div>

      {safetyShown && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-lg font-bold mb-4">
              おそとで つかうときは あんぜんな ところで つかおうね
            </p>
            <button
              onClick={handleSafetyDismiss}
              className="bg-pink text-white rounded-full px-8 py-3 font-bold"
            >
              わかった！
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
