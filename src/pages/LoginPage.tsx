import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../lib/auth";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();

  if (firebaseUser) {
    navigate("/", { replace: true });
    return null;
  }

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch {
      setError("ログインできませんでした。もういちど ためしてね");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="text-8xl mb-6">🌸</div>
      <h1 className="text-3xl font-bold text-pink mb-2">Flower Shot</h1>
      <p className="text-lg text-gray-600 mb-10">
        おはなの なまえを しらべよう！
      </p>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-full px-8 py-4 text-lg font-bold shadow-sm active:scale-95 transition-transform disabled:opacity-50"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt=""
          className="w-6 h-6"
        />
        {loading ? "ログインちゅう..." : "Google で ログイン"}
      </button>
      {error && (
        <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
      )}
    </div>
  );
}
