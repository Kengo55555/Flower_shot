import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import Loading from "../components/common/Loading";
import ResultCard from "../components/result/ResultCard";
import CandidateList from "../components/result/CandidateList";
import { useCapture } from "../hooks/useCapture";
import { useAuth } from "../hooks/useAuth";
import { identifyFlower, parseIdentifyResult, type IdentifyResult } from "../lib/plantnet";
import { checkCanUse, incrementUsage } from "../lib/usage-limit";
import { saveRecord } from "../lib/firestore";
import { saveImage } from "../lib/indexeddb";

export default function ResultPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { compressedBlob, imagePreviewUrl, location, isLocationRecorded, clearCaptureData } =
    useCapture();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<IdentifyResult | null>(null);
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [limitMessage, setLimitMessage] = useState("");

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
          setLoading(false);
          return;
        }

        const response = await identifyFlower(compressedBlob);
        if (cancelled) return;
        const parsed = parseIdentifyResult(response);
        setResult(parsed);

        await incrementUsage(user.uid);
      } catch {
        if (!cancelled) {
          setError("うまく しらべられなかったよ。もういちど ためしてね");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [compressedBlob, user, navigate]);

  const handleSave = async () => {
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

    setSaving(true);
    try {
      const recordId = await saveRecord({
        userId: user.uid,
        photoLocalKey: "",
        flowerName,
        flowerNameOriginal,
        candidates: result?.candidates || [],
        confidence,
        capturedAt: new Date(),
        location: location || null,
        isLocationRecorded,
      });

      await saveImage(recordId, compressedBlob);

      const { updateDoc, doc } = await import("firebase/firestore");
      const { db } = await import("../lib/firebase");
      await updateDoc(doc(db, "records", recordId), {
        photoLocalKey: recordId,
      });

      setSavedRecordId(recordId);
      setSaved(true);
      clearCaptureData();
    } catch {
      setError("ほぞんできなかったよ。もういちど ためしてね");
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    result?.status === "found" ||
    (result?.status === "candidates" && selectedIndex !== null);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="けっか" onBack={() => navigate("/")} />

      <div className="flex-1 px-4 py-6">
        {loading && <Loading />}

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

        {!loading && !error && !limitMessage && result && (
          <>
            {result.status === "not_found" && (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-lg font-bold">
                  おはなが みつからなかったよ
                </p>
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

            {!saved && canSave && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full mt-6 bg-green text-white rounded-full py-4 font-bold text-lg disabled:opacity-50"
              >
                {saving ? "ほぞんしているよ..." : "ほぞんする"}
              </button>
            )}

            {saved && (
              <div className="mt-6 text-center animate-bounce-in">
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
          </>
        )}
      </div>
    </div>
  );
}
