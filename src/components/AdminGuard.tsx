
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setChecking(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching user role:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.role === 'admin');
        }
      } catch (err) {
        console.error('💥 Unexpected error:', err);
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    };

    if (!loading) {
      checkAdminRole();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !checking) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (!isAdmin) {
        navigate('/');
        return;
      }
    }
  }, [user, loading, checking, isAdmin, navigate]);

  
  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to access admin area</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
