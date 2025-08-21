
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { 
  QrCode, 
  Share2, 
  CheckCircle,
  FileText,
  Copy,
  Download,
  Share
} from "lucide-react";

interface VPSharingProps {
  verifiableCredentials: any[];
  userDID: string;
  privateKey: string;
}

export const VPSharing = ({ verifiableCredentials, userDID, privateKey }: VPSharingProps) => {
  const [selectedCredentials, setSelectedCredentials] = useState<number[]>([]);
  const [generatedVP, setGeneratedVP] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const handleCredentialSelection = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedCredentials([...selectedCredentials, index]);
    } else {
      setSelectedCredentials(selectedCredentials.filter(i => i !== index));
    }
  };

  const generateVP = async () => {
    if (selectedCredentials.length === 0) {
      toast({
        title: "No Credentials Selected",
        description: "Please select at least one credential to share",
        variant: "destructive"
      });
      return;
    }

    // Get selected VCs
    const selectedVCs = selectedCredentials.map(index => verifiableCredentials[index]);

    // Create Verifiable Presentation
    const vp = {
      "@context": ["https://www.w3.org/2018/credentials/v1"],
      "type": ["VerifiablePresentation"],
      "verifiableCredential": selectedVCs,
      "holder": userDID,
      "proof": {
        "type": "Ed25519Signature2020",
        "created": new Date().toISOString(),
        "verificationMethod": `${userDID}#key-1`,
        "proofPurpose": "authentication",
        "jws": `mock_signature_${Date.now()}` // In real implementation, sign with private key
      }
    };

    const vpString = JSON.stringify(vp, null, 2);
    setGeneratedVP(vpString);

    // Generate QR code URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(vpString)}`;
    setQrCodeUrl(qrUrl);

    toast({
      title: "VP Generated",
      description: `Verifiable Presentation created with ${selectedVCs.length} credential(s)`,
    });
  };

  const copyVP = () => {
    if (generatedVP) {
      navigator.clipboard.writeText(generatedVP);
      toast({
        title: "Copied!",
        description: "Verifiable Presentation copied to clipboard",
      });
    }
  };

  const saveQRCode = async () => {
    if (qrCodeUrl) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VP_QR_${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "QR Code Saved",
          description: "QR code has been downloaded to your device",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save QR code",
          variant: "destructive"
        });
      }
    }
  };

  const shareQRCode = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `VP_QR_${Date.now()}.png`, { type: 'image/png' });
        
        await navigator.share({
          title: 'Verifiable Presentation QR Code',
          text: 'My credential verification QR code',
          files: [file]
        });
        
        toast({
          title: "Shared!",
          description: "QR code has been shared",
        });
      } catch (error) {
        // Fallback to copying the QR code URL
        if (qrCodeUrl) {
          navigator.clipboard.writeText(qrCodeUrl);
          toast({
            title: "Link Copied",
            description: "QR code link copied to clipboard",
          });
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      if (qrCodeUrl) {
        navigator.clipboard.writeText(qrCodeUrl);
        toast({
          title: "Link Copied",
          description: "QR code link copied to clipboard",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="backdrop-blur-xl bg-slate-900/60 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Create Verifiable Presentation
          </CardTitle>
          <CardDescription className="text-slate-200">
            Select credentials to share and generate a VP with QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">Select Credentials to Share</h4>
              {verifiableCredentials.length === 0 ? (
                <p className="text-muted-foreground text-sm">No credentials available</p>
              ) : (
                <div className="space-y-2">
                  {verifiableCredentials.map((vc, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-slate-900/50 border border-white/10 rounded-lg">
                      <Checkbox
                        id={`vc-${index}`}
                        checked={selectedCredentials.includes(index)}
                        onCheckedChange={(checked) => handleCredentialSelection(index, checked as boolean)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {vc.type[1]}
                          </Badge>
                          <span className="font-medium">{vc.credentialSubject.position}</span>
                        </div>
                        <p className="text-sm text-slate-300">
                          {vc.credentialSubject.company} • Issued: {new Date(vc.issuanceDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              onClick={generateVP}
              disabled={selectedCredentials.length === 0}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generate Verifiable Presentation
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedVP && (
        <Card className="backdrop-blur-xl bg-slate-900/60 border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle className="h-5 w-5" />
              VP Generated Successfully
            </CardTitle>
            <CardDescription className="text-slate-300">
              Share this VP with verifiers via QR code or direct transfer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <div className="text-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="VP QR Code" 
                      className="border border-white/10 rounded-lg mx-auto"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Scan this QR code to share your credentials
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button variant="outline" onClick={copyVP}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy VP
                </Button>
                <Button variant="outline" onClick={saveQRCode}>
                  <Download className="mr-2 h-4 w-4" />
                  Save QR Code
                </Button>
                <Button variant="outline" onClick={shareQRCode}>
                  <Share className="mr-2 h-4 w-4" />
                  Share QR Code
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
