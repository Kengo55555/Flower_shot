import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUsageLimit } from "../hooks/useUsageLimit";
import { useRecords } from "../hooks/useRecords";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useTheme } from "../hooks/useTheme";
import { signOutUser } from "../lib/auth";
import { updateUserSettings } from "../lib/firestore";
import { getStorageEstimate } from "../lib/indexeddb";
import { DAILY_USER_LIMIT } from "../constants";

const BG_COLORS = [
  { label: "レモン", value: "#FFF44F" },
  { label: "クリーム", value: "#FFF8E7" },
  { label: "さくら", value: "#FFE4E8" },
  { label: "そら", value: "#E0F0FF" },
  { label: "みどり", value: "#E8F5E9" },
  { label: "ラベンダー", value: "#F3E5F5" },
  { label: "しろ", value: "#FFFFFF" },
];

const BUTTON_COLORS = [
  { label: "ピンク", value: "#FF9CAD" },
  { label: "あか", value: "#EF5350" },
  { label: "オレンジ", value: "#FFA726" },
  { label: "みどり", value: "#66BB6A" },
  { label: "あお", value: "#42A5F5" },
  { label: "むらさき", value: "#AB47BC" },
];

const EMOJIS = ["🌻", "🌸", "🌷", "🌹", "🌺", "💐", "🌼", "🏵️"];

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userCount } = useUsageLimit();
  const { records } = useRecords();
  const { isInstalled } = usePwaInstall();
  const { bgColor, buttonColor, emoji, setBgColor, setButtonColor, setEmoji } = useTheme();
  const [locationOn, setLocationOn] = useState(
    user?.settings.locationDefaultOn ?? true
  );
  const [storageMB, setStorageMB] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    getStorageEstimate().then((est) => {
      setStorageMB(Math.round(est.usage / 1024 / 1024));
    });
  }, []);

  const handleLocationToggle = async () => {
    if (!user) return;
    const newVal = !locationOn;
    setLocationOn(newVal);
    await updateUserSettings(user.uid, { locationDefaultOn: newVal });
  };

  const handleLogout = async () => {
    await signOutUser();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-center mb-6">⚙️ せってい</h1>

        {/* Account */}
        <section className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm text-gray-500 mb-3">アカウント</h2>
          <div className="flex items-center gap-3">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="font-bold">{user?.displayName}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </section>

        {/* Theme - Background */}
        <section className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm text-gray-500 mb-3">はいけいの いろ</h2>
          <div className="flex flex-wrap gap-2">
            {BG_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setBgColor(c.value)}
                className={`w-12 h-12 rounded-xl border-3 transition-transform ${
                  bgColor === c.value ? "border-gray-800 scale-110" : "border-gray-200"
                }`}
                style={{ backgroundColor: c.value }}
                aria-label={c.label}
              />
            ))}
          </div>
        </section>

        {/* Theme - Button */}
        <section className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm text-gray-500 mb-3">ボタンの いろ</h2>
          <div className="flex flex-wrap gap-2">
            {BUTTON_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setButtonColor(c.value)}
                className={`w-12 h-12 rounded-xl border-3 transition-transform ${
                  buttonColor === c.value ? "border-gray-800 scale-110" : "border-gray-200"
                }`}
                style={{ backgroundColor: c.value }}
                aria-label={c.label}
              />
            ))}
          </div>
        </section>

        {/* Theme - Emoji */}
        <section className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm text-gray-500 mb-3">タイトルの おはな</h2>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-12 h-12 rounded-xl text-2xl border-3 transition-transform ${
                  emoji === e ? "border-gray-800 scale-110 bg-gray-100" : "border-gray-200"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm text-gray-500 mb-3">いちじょうほう</h2>
          <div className="flex items-center justify-between">
            <span className="text-base">ばしょを きろくする（きほん）</span>
            <button
              onClick={handleLocationToggle}
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
          <p className="text-xs text-gray-400 mt-2">
            ONにすると おはなを みつけた ばしょを ちずに のこせるよ
          </p>
        </section>

        {/* Storage */}
        <section className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm text-gray-500 mb-3">ストレージ</h2>
          <div className="space-y-2 text-sm">
            <p>📸 しゃしん: {records.length}まい（やく{storageMB}MB）</p>
            <p>📊 きろく: {records.length}けん</p>
            <p>🌸 きょうの はんてい: {userCount}かい / {DAILY_USER_LIMIT}かい</p>
            <p>🏠 ホームがめん ついか: {isInstalled ? "✅ ずみ" : "❌ まだ"}</p>
          </div>
        </section>

        {/* App Info */}
        <section className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm text-gray-500 mb-3">アプリじょうほう</h2>
          <p className="text-sm">Flower Shot v1.0.0</p>
        </section>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full text-red-400 py-3 text-sm"
        >
          ログアウト
        </button>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
          <div className="bg-white rounded-2xl p-6 text-center max-w-sm">
            <p className="text-lg font-bold mb-4">ログアウトしますか？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-200 rounded-full py-3 font-bold"
              >
                やめる
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-400 text-white rounded-full py-3 font-bold"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
