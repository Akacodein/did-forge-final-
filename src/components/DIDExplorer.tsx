
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Globe, 
  Clock, 
  Database,
  ExternalLink,
  Filter,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/contexts/AuthContext";

type DID = Tables<'dids'>;
type IONOperation = Tables<'ion_operations'>;
type IPFSPin = Tables<'ipfs_pins'>;

interface DIDWithDetails extends DID {
  ion_operations: IONOperation[];
  ipfs_pins: IPFSPin[];
}

export const DIDExplorer = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [recentDIDs, setRecentDIDs] = useState<DIDWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [networkStats, setNetworkStats] = useState({
    totalDIDs: 0,
    anchored: 0,
    pending: 0
  });
  const { user } = useAuth();

  const fetchRecentDIDs = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data: dids, error } = await supabase
        .from('dids')
        .select(`
          *,
          ion_operations (*),
          ipfs_pins (*)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setRecentDIDs(dids as DIDWithDetails[] || []);
    } catch (err) {
      console.error('Error fetching DIDs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworkStats = async () => {
    if (!user) return;
    
    try {
      const [
        { count: totalDIDs },
        { count: anchored },
        { count: pending }
      ] = await Promise.all([
        supabase.from('dids').select('*', { count: 'exact', head: true }),
        supabase.from('dids').select('*', { count: 'exact', head: true }).eq('status', 'anchored'),
        supabase.from('dids').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setNetworkStats({
        totalDIDs: totalDIDs || 0,
        anchored: anchored || 0,
        pending: pending || 0
      });
    } catch (err) {
      console.error('Error fetching network stats:', err);
    }
  };

  useEffect(() => {
    fetchRecentDIDs();
    fetchNetworkStats();

    // Set up realtime subscription
    const channel = supabase
      .channel('did-explorer-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dids'
        },
        () => {
          fetchRecentDIDs();
          fetchNetworkStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('dids')
        .select(`
          *,
          ion_operations (*),
          ipfs_pins (*)
        `)
        .or(`did_identifier.ilike.%${searchQuery}%,public_key.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecentDIDs(data as DIDWithDetails[] || []);
    } catch (err) {
      console.error('Error searching DIDs:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'anchored':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <Globe className="h-3 w-3 mr-1" />
            Anchored
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive">
            Failed
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Explore DIDs
          </CardTitle>
          <CardDescription>
            Search and browse your decentralized identifiers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by DID identifier or public key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" onClick={() => {
              setSearchQuery("");
              fetchRecentDIDs();
            }}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{networkStats.totalDIDs}</p>
                <p className="text-sm text-muted-foreground">Total DIDs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Database className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{networkStats.anchored}</p>
                <p className="text-sm text-muted-foreground">Anchored</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{networkStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent DIDs - removed per request */}
      {/* (Previously showed user's latest DIDs list) */}
    </div>
  );
};
