import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Loading from "../components/common/Loading";
import ResultCard from "../components/result/ResultCard";
import CandidateList from "../components/result/CandidateList";
import LocationPicker from "../components/map/LocationPicker";
import { useCapture } from "../hooks/useCapture";
import { useAuth } from "../hooks/useAuth";
import { identifyFlower, parseIdentifyResult, type IdentifyResult } from "../lib/plantnet";
import { checkCanUse, incrementUsage } from "../lib/usage-limit";
import { getCurrentLocation } from "../lib/geolocation";
import { saveRecord } from "../lib/firestore";
import { saveImage } from "../lib/indexeddb";
import type { GeoLocation } from "../types";

type Step = "identifying" | "result" | "location" | "saving" | "done";

export default function ResultPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { compressedBlob, imagePreviewUrl, clearCaptureData } = useCapture();

  const [step, setStep] = useState<Step>("identifying");
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [limitMessage, setLimitMessage] = useState("");

  // 場所関連
  const [pickedLocation, setPickedLocation] = useState<GeoLocation | null>(null);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [gettingGps, setGettingGps] = useState(false);

  // 保存関連
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);

  // 花の判定
  useEffect(() => {
    if (!compressedBlob || !user) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const usage = await checkCanUse(user.uid);
        if (!usage.canUse) {
          setLimitMessage(
            usage.reason === "global_limit"
              ? "きょうは みんなが たくさん あそんでくれたよ！あしたまた あそぼうね"
              : "きょうの おはなさがしは おしまい！あしたまた あそぼうね"
          );
          setStep("result");
          return;
        }

        const response = await identifyFlower(compressedBlob);
        if (cancelled) return;
        const parsed = await parseIdentifyResult(response);
        setResult(parsed);
        await incrementUsage(user.uid);
        setStep("result");
      } catch {
        if (!cancelled) {
          setError("うまく しらべられなかったよ。もういちど ためしてね");
          setStep("result");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [compressedBlob, user, navigate]);

  const canProceedToLocation =
    result?.status === "found" ||
    (result?.status === "candidates" && selectedIndex !== null);

  const handleGoToLocation = () => {
    setStep("location");
    // 場所選択ステップに入ったら自動でGPS取得開始
    autoGps();
  };

  const autoGps = async () => {
    setGettingGps(true);
    const loc = await getCurrentLocation();
    setGettingGps(false);
    if (loc) {
      setPickedLocation(loc);
    }
    // 失敗しても何も表示しない（手動ボタンがあるので）
  };

  const handleManualGps = async () => {
    setGettingGps(true);
    const loc = await getCurrentLocation();
    setGettingGps(false);
    if (loc) {
      setPickedLocation(loc);
    } else {
      alert("いちじょうほうが とれなかったよ。ちずから えらんでね");
      setShowMapPicker(true);
    }
  };

  const handleSave = async (withLocation: boolean) => {
    if (!user || !compressedBlob) return;

    const flowerName =
      result?.status === "found"
        ? result.topResult!.name
        : result?.candidates[selectedIndex!]?.name || "";
    const flowerNameOriginal =
      result?.status === "found"
        ? result.topResult!.nameOriginal
        : flowerName;
    const confidence =
      result?.status === "found"
        ? result.topResult!.confidence
        : result?.candidates[selectedIndex!]?.confidence || 0;

    const location = withLocation ? pickedLocation : null;

    setStep("saving");
    try {
      const { doc: createDoc, collection: getCollection } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      const newDocRef = createDoc(getCollection(db, "records"));
      const recordId = newDocRef.id;

      await saveRecord({
        userId: user.uid,
        photoLocalKey: recordId,
        flowerName,
        flowerNameOriginal,
        candidates: result?.candidates || [],
        confidence,
        capturedAt: new Date(),
        location,
        isLocationRecorded: withLocation && location !== null,
      }, recordId);

      await saveImage(recordId, compressedBlob);

      setSavedRecordId(recordId);
      setStep("done");
      clearCaptureData();
    } catch {
      setError("ほぞんできなかったよ。もういちど ためしてね");
      setStep("result");
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="けっか" onBack={() => navigate("/")} />

      <div className="flex-1 px-4 py-6">

        {/* ステップ1: 判定中 */}
        {step === "identifying" && <Loading />}

        {/* 利用制限 */}
        {limitMessage && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">😴</p>
            <p className="text-lg font-bold">{limitMessage}</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-pink text-white rounded-full px-8 py-3 font-bold"
            >
              ホームに もどる
            </button>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">😢</p>
            <p className="text-lg font-bold mb-6">{error}</p>
            <button
              onClick={() => navigate("/camera")}
              className="bg-pink text-white rounded-full px-8 py-3 font-bold"
            >
              もういちど さつえいする
            </button>
          </div>
        )}

        {/* ステップ2: 判定結果 */}
        {step === "result" && !error && !limitMessage && result && (
          <>
            {result.status === "not_found" && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-bold">おはなが みつからなかったよ</p>
                <button
                  onClick={() => navigate("/camera")}
                  className="mt-6 bg-pink text-white rounded-full px-8 py-3 font-bold"
                >
                  もういちど さつえいする
                </button>
              </div>
            )}

            {result.status === "found" && imagePreviewUrl && (
              <ResultCard
                flowerName={result.topResult!.name}
                flowerNameOriginal={result.topResult!.nameOriginal}
                confidence={result.topResult!.confidence}
                imageUrl={imagePreviewUrl}
              />
            )}

            {result.status === "candidates" && imagePreviewUrl && (
              <CandidateList
                candidates={result.candidates}
                imageUrl={imagePreviewUrl}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
              />
            )}

            {canProceedToLocation && (
              <button
                onClick={handleGoToLocation}
                className="w-full mt-6 bg-green text-white rounded-full py-4 font-bold text-lg"
              >
                つぎへ → ばしょを きろくする
              </button>
            )}
          </>
        )}

        {/* ステップ3: 場所選択 */}
        {step === "location" && (
          <div>
            <p className="text-xl font-bold text-center mb-4">
              📍 ばしょを きろくする？
            </p>

            {gettingGps && !pickedLocation && (
              <div className="text-center py-4 mb-4">
                <p className="text-base animate-float">📡</p>
                <p className="text-sm text-gray-500 mt-2">いまの ばしょを とっているよ...</p>
              </div>
            )}

            {pickedLocation && (
              <div className="bg-green-light rounded-xl p-3 mb-4 text-center">
                <p className="text-sm font-bold text-green">✅ ばしょを とれたよ！</p>
              </div>
            )}

            {!gettingGps && !pickedLocation && (
              <div className="bg-yellow rounded-xl p-3 mb-4 text-center">
                <p className="text-sm">じどうで とれなかったよ。したの ボタンから えらんでね</p>
              </div>
            )}

            <div className="flex gap-2 mb-4">
              <button
                onClick={handleManualGps}
                disabled={gettingGps}
                className="flex-1 bg-white rounded-xl p-3 text-sm font-bold text-center shadow-sm active:scale-95 disabled:opacity-50"
              >
                📍 もういちど とる
              </button>
              <button
                onClick={() => setShowMapPicker(true)}
                className="flex-1 bg-white rounded-xl p-3 text-sm font-bold text-center shadow-sm active:scale-95"
              >
                🗺️ ちずで えらぶ
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSave(true)}
                disabled={!pickedLocation}
                className="w-full bg-green text-white rounded-full py-4 font-bold text-lg disabled:opacity-30"
              >
                ばしょつきで ほぞんする
              </button>
              <button
                onClick={() => handleSave(false)}
                className="w-full bg-gray-200 rounded-full py-3 font-bold text-base"
              >
                ばしょなしで ほぞんする
              </button>
            </div>
          </div>
        )}

        {/* ステップ4: 保存中 */}
        {step === "saving" && <Loading message="ほぞんしているよ..." />}

        {/* ステップ5: 完了 */}
        {step === "done" && (
          <div className="text-center animate-bounce-in">
            <p className="text-5xl mb-2">✅</p>
            <p className="text-lg font-bold mb-4">ほぞんできたよ！</p>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/detail/${savedRecordId}`)}
                className="w-full bg-sky text-white rounded-full py-3 font-bold"
              >
                もっと くわしく
              </button>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-200 rounded-full py-3 font-bold"
              >
                ホームに もどる
              </button>
            </div>
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
