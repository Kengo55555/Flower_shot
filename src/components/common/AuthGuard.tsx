import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signOutUser } from "../../lib/auth";
import Loading from "./Loading";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { firebaseUser, isLoading, isBlocked, isNotAllowed } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading message="よみこみちゅう..." />
      </div>
    );
  }

  if (isNotAllowed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-6xl mb-6">🔒</p>
        <p className="text-xl font-bold mb-4">
          このアプリは しょうたいせいです
        </p>
        <p className="text-sm text-gray-600 mb-6">
          りようするには かんりしゃに<br />メールアドレスの とうろくを おねがいしてね
        </p>
        <p className="text-xs text-gray-400 mb-6">
          {firebaseUser?.email}
        </p>
        <button
          onClick={() => signOutUser()}
          className="text-red-400 text-sm underline"
        >
          ログアウト
        </button>
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-6xl mb-6">🚫</p>
        <p className="text-xl font-bold mb-4">
          ごりようを ていししました
        </p>
        <p className="text-sm text-gray-600">
          おといあわせは nomurakengo@gmail.com まで
        </p>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
