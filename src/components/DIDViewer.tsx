
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { 
  Search, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Key,
  Globe,
  Database,
  ExternalLink
} from "lucide-react";

export const DIDViewer = () => {
  const [didInput, setDidInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [didData, setDidData] = useState<any>(null);

  const handleResolve = async () => {
    if (!didInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid DID",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate DID resolution
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockResolution = {
      didDocument: {
        "@context": ["https://www.w3.org/ns/did/v1"],
        "id": didInput,
        "verificationMethod": [
          {
            "id": `${didInput}#key-1`,
            "type": "EcdsaSecp256k1VerificationKey2019",
            "controller": didInput,
            "publicKeyHex": "042a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d"
          }
        ],
        "authentication": [`${didInput}#key-1`],
        "assertionMethod": [`${didInput}#key-1`],
        "service": [
          {
            "id": `${didInput}#service-1`,
            "type": "LinkedDomains",
            "serviceEndpoint": "https://example.com"
          }
        ]
      },
      metadata: {
        "method": {
          "published": true,
          "recoveryCommitment": "EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9a0QbVnhQ",
          "updateCommitment": "EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9a0QbVnhQ"
        },
        "canonicalId": didInput,
        "equivalentId": [didInput],
        "created": "2024-01-15T10:30:00Z",
        "updated": "2024-01-15T10:30:00Z"
      },
      ipfsHash: "QmX7kVjGnhHGmELhPpVNfKzRhQxmvF3L8WqNJmF7zCpK2",
      bitcoinAnchor: {
        "blockHeight": 825431,
        "blockHash": "00000000000000000008e3b5b7c8e9f4a2b1c3d5e6f7a8b9c0d1e2f3a4b5c6d7",
        "transactionId": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2"
      }
    };
    
    setDidData(mockResolution);
    setIsLoading(false);
    
    toast({
      title: "DID Resolved Successfully",
      description: "DID document retrieved and verified",
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Resolve DID
          </CardTitle>
          <CardDescription>
            Enter a DID to resolve and view its document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="did-input">DID Identifier</Label>
            <Input
              id="did-input"
              placeholder="did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9a0QbVnhQ"
              value={didInput}
              onChange={(e) => setDidInput(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleResolve} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Search className="mr-2 h-4 w-4 animate-spin" />
                Resolving DID...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Resolve DID
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Resolution Results */}
      {didData && (
        <div className="space-y-6">
          {/* Status Overview */}
          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                DID Resolution Successful
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Published
                  </Badge>
                  <span className="text-sm text-muted-foreground">On ION Network</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    <Database className="h-3 w-3 mr-1" />
                    IPFS
                  </Badge>
                  <code className="text-xs text-muted-foreground">{didData.ipfsHash?.substring(0, 12)}...</code>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                    <Globe className="h-3 w-3 mr-1" />
                    Bitcoin
                  </Badge>
                  <span className="text-xs text-muted-foreground">Block #{didData.bitcoinAnchor?.blockHeight}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DID Document */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                DID Document
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">JSON-LD</Badge>
                <Badge variant="secondary">Verified</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={JSON.stringify(didData.didDocument, null, 2)}
                readOnly
                className="font-mono text-xs min-h-[400px]"
              />
            </CardContent>
          </Card>

          {/* Verification Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Verification Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {didData.didDocument.verificationMethod?.map((method: any, index: number) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{method.type}</Badge>
                      <Badge variant="secondary">#{index + 1}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs">ID</Label>
                        <code className="block text-xs bg-muted p-2 rounded mt-1">{method.id}</code>
                      </div>
                      <div>
                        <Label className="text-xs">Public Key</Label>
                        <code className="block text-xs bg-muted p-2 rounded mt-1 break-all">{method.publicKeyHex}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          {didData.didDocument.service && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {didData.didDocument.service.map((service: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{service.type}</Badge>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <Label className="text-xs">Service ID</Label>
                          <code className="block text-xs bg-muted p-2 rounded mt-1">{service.id}</code>
                        </div>
                        <div>
                          <Label className="text-xs">Endpoint</Label>
                          <code className="block text-xs bg-muted p-2 rounded mt-1">{service.serviceEndpoint}</code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata & Anchoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground mt-1">{didData.metadata.created}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Updated</Label>
                  <p className="text-sm text-muted-foreground mt-1">{didData.metadata.updated}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">IPFS Hash</Label>
                  <code className="block text-xs bg-muted p-2 rounded mt-1">{didData.ipfsHash}</code>
                </div>
                <div>
                  <Label className="text-sm font-medium">Bitcoin Transaction</Label>
                  <code className="block text-xs bg-muted p-2 rounded mt-1 break-all">{didData.bitcoinAnchor?.transactionId}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
