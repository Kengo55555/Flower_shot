import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}
