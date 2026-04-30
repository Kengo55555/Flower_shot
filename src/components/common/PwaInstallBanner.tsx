import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePwaInstall } from "../../hooks/usePwaInstall";

export default function PwaInstallBanner() {
  const { isInstalled, isIOS } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (isInstalled || !isIOS || dismissed) return null;

  return (
    <div className="bg-yellow text-gray-800 px-4 py-3 flex items-center gap-2 text-sm sticky top-0 z-50">
      <span className="flex-1">
        ホームがめんに ついかすると しゃしんが きえなくなるよ！
      </span>
      <button
        onClick={() => navigate("/tutorial")}
        className="bg-white rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap"
      >
        くわしく
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-600 text-lg leading-none"
        aria-label="とじる"
      >
        ✕
      </button>
    </div>
  );
}
