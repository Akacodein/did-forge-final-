
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthGuard: Checking auth state:', {
      loading,
      hasUser: !!user,
      hasSession: !!session,
      userId: user?.id,
      userEmail: user?.email,
      currentPath: window.location.pathname
    });

    if (!loading && !user && window.location.pathname !== '/auth') {
      console.log('AuthGuard: No authenticated user, redirecting to /auth');
      navigate('/auth');
    }
  }, [user, loading, session, navigate]);

  if (loading) {
    console.log('AuthGuard: Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('AuthGuard: No user found, should redirect to auth');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Redirecting to authentication...</p>
        </div>
      </div>
    );
  }

  console.log('AuthGuard: User authenticated, rendering children');
  return <>{children}</>;
};
