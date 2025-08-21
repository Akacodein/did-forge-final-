
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Key,
  Globe,
  Database,
  FileText,
  Search
} from "lucide-react";

export const VerificationDashboard = () => {
  const [didToVerify, setDidToVerify] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verificationProgress, setVerificationProgress] = useState(0);

  const handleVerify = async () => {
    if (!didToVerify.trim()) {
      toast({
        title: "Error",
        description: "Please enter a DID to verify",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);
    setVerificationProgress(0);
    
    // Simulate verification process with progress updates
    const steps = [
      { progress: 20, message: "Resolving DID..." },
      { progress: 40, message: "Checking IPFS storage..." },
      { progress: 60, message: "Verifying Bitcoin anchor..." },
      { progress: 80, message: "Validating signatures..." },
      { progress: 100, message: "Verification complete!" }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setVerificationProgress(step.progress);
    }
    
    // Mock verification result
    const mockResult = {
      did: didToVerify,
      isValid: true,
      checks: {
        didResolution: { status: "passed", message: "DID resolved successfully" },
        ipfsStorage: { status: "passed", message: "Document found on IPFS" },
        bitcoinAnchor: { status: "passed", message: "Anchored to Bitcoin block #825431" },
        signatureVerification: { status: "passed", message: "All signatures valid" },
        documentIntegrity: { status: "passed", message: "Document integrity verified" }
      },
      metadata: {
        created: "2024-01-15T10:30:00Z",
        lastVerified: new Date().toISOString(),
        blockHeight: 825431,
        ipfsHash: "QmX7kVjGnhHGmELhPpVNfKzRhQxmvF3L8WqNJmF7zCpK2",
        verificationMethods: 2,
        services: 1
      }
    };
    
    setVerificationResult(mockResult);
    setIsVerifying(false);
    
    toast({
      title: "Verification Complete",
      description: mockResult.isValid ? "DID is valid and verified" : "DID verification failed",
      variant: mockResult.isValid ? "default" : "destructive"
    });
  };

  const getCheckIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCheckBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verify DID
          </CardTitle>
          <CardDescription>
            Comprehensive verification of DID integrity and anchoring status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verify-did">DID to Verify</Label>
            <Input
              id="verify-did"
              placeholder="did:ion:EiClkZMDxPKqC9c-umQfTkR8vvZ9JPhl_xLDI9a0QbVnhQ"
              value={didToVerify}
              onChange={(e) => setDidToVerify(e.target.value)}
              disabled={isVerifying}
            />
          </div>
          
          {isVerifying && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Verification Progress</span>
                <span>{verificationProgress}%</span>
              </div>
              <Progress value={verificationProgress} className="w-full" />
            </div>
          )}
          
          <Button 
            onClick={handleVerify} 
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Shield className="mr-2 h-4 w-4 animate-pulse" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify DID
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Results */}
      {verificationResult && (
        <div className="space-y-6">
          {/* Overall Status */}
          <Card className={`border-2 ${verificationResult.isValid 
            ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' 
            : 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${verificationResult.isValid 
                ? 'text-green-700 dark:text-green-400' 
                : 'text-red-700 dark:text-red-400'
              }`}>
                {verificationResult.isValid ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <AlertCircle className="h-6 w-6" />
                )}
                {verificationResult.isValid ? 'DID Verified Successfully' : 'DID Verification Failed'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <p className="font-medium mb-2">DID:</p>
                <code className="bg-background p-2 rounded border break-all block">
                  {verificationResult.did}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Verification Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Verification Checks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(verificationResult.checks).map(([checkName, check]: [string, any]) => (
                  <div key={checkName} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCheckIcon(check.status)}
                      <div>
                        <p className="font-medium capitalize">
                          {checkName.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {check.message}
                        </p>
                      </div>
                    </div>
                    {getCheckBadge(check.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Verification Metadata
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(verificationResult.metadata.created).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Last Verified</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(verificationResult.metadata.lastVerified).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Bitcoin Block Height</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      #{verificationResult.metadata.blockHeight}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">IPFS Hash</Label>
                    <code className="block text-xs bg-muted p-2 rounded mt-1">
                      {verificationResult.metadata.ipfsHash}
                    </code>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Verification Methods</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {verificationResult.metadata.verificationMethods} method(s)
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Services</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {verificationResult.metadata.services} service(s)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline">
                  <Search className="mr-2 h-4 w-4" />
                  View in Explorer
                </Button>
                <Button variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  Check Keys
                </Button>
                <Button variant="outline">
                  <Globe className="mr-2 h-4 w-4" />
                  View Services
                </Button>
                <Button variant="outline">
                  <Database className="mr-2 h-4 w-4" />
                  IPFS Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
