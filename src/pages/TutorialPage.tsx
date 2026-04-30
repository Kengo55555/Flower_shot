import { useNavigate } from "react-router-dom";
import { usePwaInstall } from "../hooks/usePwaInstall";

export default function TutorialPage() {
  const navigate = useNavigate();
  const { isInstalled } = usePwaInstall();

  if (isInstalled) {
    navigate("/", { replace: true });
    return null;
  }

  const handleDone = () => {
    localStorage.setItem("flower_shot_tutorial_shown", "true");
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-8">
        Flower Shot を ながく つかうために
      </h1>

      <div className="space-y-8 w-full max-w-sm">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-5xl mb-3">📱</p>
          <p className="text-xl font-bold mb-1">ステップ 1</p>
          <p className="text-base">
            したの{" "}
            <span className="inline-block bg-gray-100 px-2 py-0.5 rounded">
              共有
            </span>{" "}
            ボタンを タップしてね
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-5xl mb-3">📲</p>
          <p className="text-xl font-bold mb-1">ステップ 2</p>
          <p className="text-base">
            「ホームがめんに ついか」を えらんでね
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-xl font-bold mb-1">ステップ 3</p>
          <p className="text-base">
            できたら ホームがめんから ひらいてね！
          </p>
        </div>
      </div>

      <button
        onClick={handleDone}
        className="mt-10 text-gray-500 underline text-sm"
      >
        あとで やる
      </button>
    </div>
  );
}
