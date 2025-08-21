
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
  Eye,
  EyeOff,
  Download,
  Share2,
  Plus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useDIDs } from "@/hooks/useDIDs";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VPSharing } from "@/components/VPSharing";

export const UserWallet = () => {
  const { user } = useAuth();
  const { dids } = useDIDs();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [verifiableCredentials, setVerifiableCredentials] = useState<any[]>([]);

  const userDID = dids[0]; // User can only have one DID

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!userDID || !user) return;

      try {
        // Fetch verifiable credentials from database
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

        // Transform database credentials to the format expected by the UI
        const transformedCredentials = credentials?.map(cred => cred.credential_data) || [];
        setVerifiableCredentials(transformedCredentials);
      } catch (error) {
        console.error('Error fetching credentials:', error);
      }
    };

    fetchCredentials();
  }, [userDID, user]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const exportWallet = () => {
    if (!userDID) return;

    const walletData = {
      did: userDID.did_identifier,
      publicKey: userDID.public_key,
      privateKey: userDID.private_key_encrypted,
      verifiableCredentials,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(walletData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Wallet Exported",
      description: "Your wallet has been exported securely.",
    });
  };

  if (!userDID) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Your Digital Wallet
            </CardTitle>
            <CardDescription>
              Your DID has been created and is being anchored to Bitcoin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground mb-2">
                Your DID is ready! Anchoring to Bitcoin...
              </p>
              <p className="text-xs text-muted-foreground">
                Background anchoring in progress - you can start using your wallet now
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Your Digital Wallet
          </CardTitle>
          <CardDescription>
            Securely manage your DID, keys, and verifiable credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="identity" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
              <TabsTrigger value="keys">Keys</TabsTrigger>
            </TabsList>

            <TabsContent value="identity" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Your DID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                      {userDID.did_identifier}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(userDID.did_identifier, "DID")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">
                    <Badge variant={userDID.status === 'anchored' ? 'default' : 'secondary'}>
                      {userDID.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(userDID.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Verifiable Credentials</h3>
                  <Badge variant="outline">{verifiableCredentials.length} VCs</Badge>
                </div>

                {verifiableCredentials.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No verifiable credentials yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {verifiableCredentials.map((vc, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">
                                {vc.credentialSubject.position || vc.credentialSubject.degree}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {vc.credentialSubject.company || vc.credentialSubject.institution}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Issued: {new Date(vc.issuanceDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline">
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

            <TabsContent value="share" className="space-y-4">
              <VPSharing 
                verifiableCredentials={verifiableCredentials}
                userDID={userDID.did_identifier}
                privateKey={userDID.private_key_encrypted}
              />
            </TabsContent>

            <TabsContent value="keys" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Public Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                      {userDID.public_key}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => copyToClipboard(userDID.public_key, "Public key")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Private Key</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-xs font-mono break-all">
                      {showPrivateKey ? userDID.private_key_encrypted : '•'.repeat(64)}
                    </code>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    {showPrivateKey && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyToClipboard(userDID.private_key_encrypted, "Private key")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ Keep your private key secure and never share it
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={exportWallet}>
              <Download className="mr-2 h-4 w-4" />
              Export Wallet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
