import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wallet, 
  Key, 
  FileText, 
  Shield, 
  Copy,
  Download,
  Share2,
  ExternalLink,
  Zap,
  Check
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VPSharing } from "@/components/VPSharing";
import { WalletConnect } from "@/components/WalletConnect";

export const ModernWallet = () => {
  const { user } = useAuth();
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);
  const [verifiableCredentials, setVerifiableCredentials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch user profile to check for connected address
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        .maybeSingle();

      if (profile?.full_name?.startsWith('0x')) {
        setConnectedAddress(profile.full_name);
      }

      // Fetch verifiable credentials
      const { data: credentials, error } = await supabase
        .from('verifiable_credentials')
        .select('*')
        .eq('holder_user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching credentials:', error);
        return;
      }

      const transformedCredentials = credentials?.map(cred => cred.credential_data) || [];
      setVerifiableCredentials(transformedCredentials);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const exportWallet = () => {
    if (!connectedAddress) return;

    const walletData = {
      address: connectedAddress,
      verifiableCredentials,
      exportedAt: new Date().toISOString(),
      type: 'OneChain Wallet Export'
    };

    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onechain-wallet-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Wallet Exported",
      description: "Your wallet data has been exported securely.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="backdrop-blur-xl bg-slate-900/60 border-white/10">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Loading wallet...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!connectedAddress) {
    return (
      <div className="space-y-6">
        <WalletConnect onWalletConnected={setConnectedAddress} />
        
        <Card className="backdrop-blur-xl bg-slate-900/60 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Why OneChain?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-lg border border-white/10">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Self-Sovereign Identity</p>
                  <p className="text-muted-foreground">You own and control your identity</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-lg border border-white/10">
                <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Private Keys</p>
                  <p className="text-muted-foreground">Stored securely in your wallet</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-lg border border-white/10">
                <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Verifiable Credentials</p>
                  <p className="text-muted-foreground">Cryptographically secure</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-slate-900/40 rounded-lg border border-white/10">
                <ExternalLink className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Interoperable</p>
                  <p className="text-muted-foreground">Works across platforms</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-xl bg-slate-900/60 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            OneChain Identity Wallet
          </CardTitle>
          <CardDescription>
            Your decentralized identity powered by OneChain blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-900/40">
              <TabsTrigger value="identity" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Identity
              </TabsTrigger>
              <TabsTrigger value="credentials" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Credentials
              </TabsTrigger>
              <TabsTrigger value="share" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="h-5 w-5 text-green-600" />
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Connected
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium">OneChain Address</label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 p-3 bg-slate-900/50 rounded-lg border border-white/10">
                      <code className="text-sm font-mono break-all">
                        {connectedAddress}
                      </code>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(connectedAddress, "OneChain address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-green-400">
                      {verifiableCredentials.length}
                    </div>
                    <div className="text-sm text-green-400/80">
                      Verifiable Credentials
                    </div>
                  </div>
                  
                  <div className="p-4 bg-slate-900/50 rounded-lg border border-white/10">
                    <div className="text-2xl font-bold text-blue-400">
                      Active
                    </div>
                    <div className="text-sm text-blue-400/80">
                      Wallet Status
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Verifiable Credentials</h3>
                  <Badge variant="outline">{verifiableCredentials.length} VCs</Badge>
                </div>

                {verifiableCredentials.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-900/50 rounded-2xl border border-white/10 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h4 className="font-medium text-muted-foreground mb-2">No credentials yet</h4>
                    <p className="text-sm text-muted-foreground">
                      Your verifiable credentials will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verifiableCredentials.map((vc, index) => (
                      <Card key={index} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">
                                {vc.credentialSubject.position || vc.credentialSubject.degree}
                              </h4>
                              <p className="text-sm text-black">
                                {vc.credentialSubject.company || vc.credentialSubject.institution}
                              </p>
                              <p className="text-xs text-black">
                                Issued: {new Date(vc.issuanceDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {vc.type[1]}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="share" className="space-y-6 mt-6">
              <VPSharing 
                verifiableCredentials={verifiableCredentials}
                userDID={connectedAddress}
                privateKey="" // OneChain handles signing
              />
            </TabsContent>

            <TabsContent value="security" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-900/50 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-400">
                      Decentralized Security
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your private keys are stored securely in your OneChain wallet. 
                    This application never has access to your private keys.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <Key className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Private Key Management</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      OneChain Wallet
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Credential Signing</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Hardware Secured
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-white/10">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Identity Verification</span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Blockchain Anchored
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6 pt-6 border-t border-white/10">
            <Button variant="outline" onClick={exportWallet} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://onechain.app', '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              OneChain
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
