
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Statistics {
  totalDIDs: number;
  verifiedDIDs: number;
  ipfsPins: number;
  pendingOperations: number;
}

export const useStatistics = () => {
  const [stats, setStats] = useState<Statistics>({
    totalDIDs: 0,
    verifiedDIDs: 0,
    ipfsPins: 0,
    pendingOperations: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchStatistics = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get total DIDs count for current user
      const { count: totalDIDs } = await supabase
        .from('dids')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get verified DIDs count for current user
      const { count: verifiedDIDs } = await supabase
        .from('verifications')
        .select('*, dids!inner(*)', { count: 'exact', head: true })
        .eq('status', 'verified')
        .eq('dids.user_id', user.id);

      // Get IPFS pins count for current user
      const { count: ipfsPins } = await supabase
        .from('ipfs_pins')
        .select('*, dids!inner(*)', { count: 'exact', head: true })
        .eq('dids.user_id', user.id);

      // Get pending operations count for current user
      const { count: pendingOperations } = await supabase
        .from('ion_operations')
        .select('*, dids!inner(*)', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq('dids.user_id', user.id);

      setStats({
        totalDIDs: totalDIDs || 0,
        verifiedDIDs: verifiedDIDs || 0,
        ipfsPins: ipfsPins || 0,
        pendingOperations: pendingOperations || 0
      });

      console.log('Statistics updated:', {
        totalDIDs: totalDIDs || 0,
        verifiedDIDs: verifiedDIDs || 0,
        ipfsPins: ipfsPins || 0,
        pendingOperations: pendingOperations || 0
      });

    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStatistics();

      // Set up realtime subscriptions for user-specific data
      const didsChannel = supabase
        .channel('user-dids-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'dids',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('DIDs table changed:', payload);
            fetchStatistics();
          }
        )
        .subscribe();

      const operationsChannel = supabase
        .channel('user-operations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ion_operations'
          },
          (payload) => {
            console.log('Operations table changed:', payload);
            fetchStatistics();
          }
        )
        .subscribe();

      const ipfsChannel = supabase
        .channel('user-ipfs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ipfs_pins'
          },
          (payload) => {
            console.log('IPFS pins table changed:', payload);
            fetchStatistics();
          }
        )
        .subscribe();

      const verificationsChannel = supabase
        .channel('user-verifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'verifications'
          },
          (payload) => {
            console.log('Verifications table changed:', payload);
            fetchStatistics();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(didsChannel);
        supabase.removeChannel(operationsChannel);
        supabase.removeChannel(ipfsChannel);
        supabase.removeChannel(verificationsChannel);
      };
    }
  }, [user]);

  return { stats, loading, refetch: fetchStatistics };
};
