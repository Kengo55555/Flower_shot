import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUsageLimit } from "../hooks/useUsageLimit";
import { useRecords } from "../hooks/useRecords";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { signOutUser } from "../lib/auth";
import { updateUserSettings } from "../lib/firestore";
import { getStorageEstimate } from "../lib/indexeddb";
import { DAILY_USER_LIMIT } from "../constants";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userCount } = useUsageLimit();
  const { records } = useRecords();
  const { isInstalled } = usePwaInstall();
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

        {/* Location */}
        <section className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h2 className="text-sm text-gray-500 mb-3">
            いちじょうほう
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-base">
              ばしょを きろくする（きほん）
            </span>
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
          <h2 className="text-sm text-gray-500 mb-3">
            ストレージ
          </h2>
          <div className="space-y-2 text-sm">
            <p>📸 しゃしん: {records.length}まい（やく{storageMB}MB）</p>
            <p>📊 きろく: {records.length}けん</p>
            <p>
              🌸 きょうの はんてい: {userCount}かい / {DAILY_USER_LIMIT}かい
            </p>
            <p>🏠 ホームがめん ついか: {isInstalled ? "✅ ずみ" : "❌ まだ"}</p>
          </div>
          {storageMB > 800 && (
            <div className="bg-orange rounded-lg p-3 mt-3 text-sm text-white">
              しゃしんを ほぞんできる ばしょが すくなくなってきました
            </div>
          )}
          {!isInstalled && (
            <button
              onClick={() => navigate("/tutorial")}
              className="mt-3 text-sky underline text-sm"
            >
              ホームがめんに ついかする
            </button>
          )}
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
