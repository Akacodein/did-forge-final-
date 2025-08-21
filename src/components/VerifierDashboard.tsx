
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Scan,
  FileText,
  User,
  Building2,
  Calendar,
  Globe
} from "lucide-react";
import { QRScanner } from "./QRScanner";

interface VerifiableCredential {
  id: string;
  type: string[];
  issuer: string | { id: string; name: string };
  issuanceDate: string;
  credentialSubject: any;
  proof: any;
}

interface VerificationResult {
  holder: string;
  validVP: boolean;
  credentials: {
    id: string;
    issuer: string;
    type: string[];
    verified: boolean;
    revoked: boolean;
    issuanceDate: string;
    credentialSubject: any;
  }[];
}

export const VerifierDashboard = () => {
  const [vpInput, setVpInput] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleQRScan = (data: string) => {
    console.log("QR scan data:", data);
    setVpInput(data);
    setShowScanner(false);
    verifyVP(data);
  };

  const verifyVP = async (vpData: string) => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      let vpObject;
      
      // Try to parse as JSON first
      try {
        vpObject = JSON.parse(vpData);
      } catch (e) {
        // If not JSON, treat as string
        vpObject = vpData;
      }

      console.log("Parsed VP object:", vpObject);

      // Mock verification logic - in production, this would verify cryptographic signatures
      const mockVerificationResult: VerificationResult = {
        holder: vpObject.holder || "did:ion:holder123",
        validVP: true,
        credentials: []
      };

      // Extract credentials from VP
      if (vpObject.verifiableCredential) {
        const credentials = Array.isArray(vpObject.verifiableCredential) 
          ? vpObject.verifiableCredential 
          : [vpObject.verifiableCredential];

        console.log("Found credentials:", credentials);

        mockVerificationResult.credentials = credentials.map((vc: VerifiableCredential, index: number) => {
          let issuerName = "Unknown Issuer";
          
          if (vc.issuer) {
            if (typeof vc.issuer === 'string') {
              issuerName = vc.issuer;
            } else if (typeof vc.issuer === 'object' && vc.issuer.name) {
              issuerName = vc.issuer.name;
            }
          }

          return {
            id: vc.id || `credential-${index}`,
            issuer: issuerName,
            type: vc.type || ["VerifiableCredential"],
            verified: true,
            revoked: false,
            issuanceDate: vc.issuanceDate || new Date().toISOString(),
            credentialSubject: vc.credentialSubject || {}
          };
        });
      }

      console.log("Verification result:", mockVerificationResult);

      setVerificationResult(mockVerificationResult);
      
      toast({
        title: "Verification Complete",
        description: `Found ${mockVerificationResult.credentials.length} credential(s) in the VP`,
      });

    } catch (error) {
      console.error("Verification error:", error);
      toast({
        title: "Verification Failed",
        description: "Invalid VP format or verification error",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualVerify = () => {
    if (!vpInput.trim()) {
      toast({
        title: "Missing Input",
        description: "Please provide a VP to verify",
        variant: "destructive"
      });
      return;
    }
    verifyVP(vpInput);
  };

  const getCredentialTypeDisplay = (types: string[]) => {
    const mainType = types.find(t => t !== "VerifiableCredential") || types[0];
    return mainType.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Verifier Dashboard
          </h1>
          <p className="text-muted-foreground">
            Verify verifiable presentations and credentials
          </p>
        </div>
      </div>

      {/* VP Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            Verify Verifiable Presentation
          </CardTitle>
          <CardDescription>
            Scan QR code or paste VP data to verify credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2"
            >
              <Scan className="h-4 w-4" />
              Scan QR Code
            </Button>
          </div>

          {showScanner && (
            <div className="border rounded-lg p-4">
              <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowScanner(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="vp-input" className="text-sm font-medium">
              Or paste VP data manually:
            </label>
            <Textarea
              id="vp-input"
              placeholder="Paste your Verifiable Presentation JSON here..."
              value={vpInput}
              onChange={(e) => setVpInput(e.target.value)}
              className="min-h-32"
            />
          </div>

          <Button 
            onClick={handleManualVerify} 
            disabled={isVerifying || !vpInput.trim()}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Shield className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify VP
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Verification Results */}
      {verificationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {verificationResult.validVP ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Verification Results
            </CardTitle>
            <CardDescription>
              Holder: {verificationResult.holder}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={verificationResult.validVP ? "default" : "destructive"}>
                  {verificationResult.validVP ? "Valid VP" : "Invalid VP"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {verificationResult.credentials.length} credential(s) found
                </span>
              </div>

              {verificationResult.credentials.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium">Credentials in this VP:</h4>
                  {verificationResult.credentials.map((credential, index) => (
                    <div key={credential.id || index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {getCredentialTypeDisplay(credential.type)}
                        </h5>
                        <div className="flex gap-2">
                          <Badge variant={credential.verified ? "default" : "destructive"}>
                            {credential.verified ? "✅ Verified" : "❌ Invalid"}
                          </Badge>
                          {!credential.revoked && (
                            <Badge variant="secondary">
                              Active
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Issuer
                          </p>
                          <p className="font-mono text-xs break-all">{credential.issuer}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Issued
                          </p>
                          <p>{new Date(credential.issuanceDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {credential.credentialSubject && Object.keys(credential.credentialSubject).length > 0 && (
                        <div>
                          <p className="text-muted-foreground text-sm mb-2">Credential Details:</p>
                          <div className="bg-muted/50 rounded p-3 text-sm">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(credential.credentialSubject, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
