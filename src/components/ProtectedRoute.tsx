import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoadingAnimation from './LoadingAnimation';
import { useSubscription } from '@/hooks/useSubscription';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePaid?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false, requirePaid = false }: ProtectedRouteProps) {
  const { user, isAdmin, loading } = useAuth();
  const { subscribed, loading: subLoading } = useSubscription();

  if (loading || (requirePaid && subLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingAnimation />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requirePaid && !subscribed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}