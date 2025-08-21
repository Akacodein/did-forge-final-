import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  Shield,
  ExternalLink,
  Check,
  Copy,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WalletConnectProps {
  onWalletConnected?: (address: string) => void;
}

export const WalletConnect = ({ onWalletConnected }: WalletConnectProps) => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [isWalletInstalled, setIsWalletInstalled] = useState(false);

  useEffect(() => {
    // Check if OneChain wallet is installed
    const checkWallet = () => {
      // Simulate OneChain wallet detection
      // In real implementation, check for window.onechain or similar
      setIsWalletInstalled(typeof window !== 'undefined');
    };

    checkWallet();
    
    // Check if user already has a connected address
    fetchUserAddress();
  }, [user]);

  const fetchUserAddress = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // In real implementation, check for onechain_address field
      if (profile?.full_name?.startsWith('0x')) {
        setConnectedAddress(profile.full_name);
      }
    } catch (error) {
      console.error('Error fetching user address:', error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);

    try {
      // Simulate OneChain wallet connection
      // In real implementation: const address = await window.onechain.connect();
      
      // Generate a mock address for demo
      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      
      // Update user profile with OneChain address
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: mockAddress // In real implementation, use onechain_address field
        })
        .eq('id', user?.id);

      if (error) throw error;

      setConnectedAddress(mockAddress);
      onWalletConnected?.(mockAddress);

      toast({
        title: "Wallet Connected!",
        description: "Your OneChain address is now linked to your identity.",
      });

    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect OneChain wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = () => {
    if (connectedAddress) {
      navigator.clipboard.writeText(connectedAddress);
      toast({
        title: "Copied!",
        description: "OneChain address copied to clipboard.",
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: user?.email })
        .eq('id', user?.id);

      if (error) throw error;

      setConnectedAddress(null);
      
      toast({
        title: "Wallet Disconnected",
        description: "Your OneChain wallet has been disconnected.",
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  if (connectedAddress) {
    return (
      <Card className="glass border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Check className="h-5 w-5" />
            OneChain Wallet Connected
          </CardTitle>
          <CardDescription>
            Your identity is secured by OneChain blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Your OneChain Address</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 bg-muted/50 rounded text-xs font-mono break-all">
                {connectedAddress}
              </code>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={copyAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-green-600 border-green-600">
              Active Identity
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={disconnectWallet}
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
          <Wallet className="h-6 w-6 text-white" />
        </div>
        <CardTitle>Connect OneChain Wallet</CardTitle>
        <CardDescription>
          Connect your OneChain wallet to create a decentralized identity powered by blockchain technology
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isWalletInstalled ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">OneChain Wallet not detected</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open('https://onechain.app/wallet', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Install OneChain Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
              <div className="text-sm">
                <p className="font-medium">Secure & Decentralized</p>
                <p className="text-muted-foreground">Your keys, your identity</p>
              </div>
            </div>
            
            <Button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};