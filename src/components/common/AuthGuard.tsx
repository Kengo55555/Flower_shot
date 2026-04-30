import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loading from "./Loading";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { firebaseUser, isLoading, isBlocked } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading message="よみこみちゅう..." />
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
