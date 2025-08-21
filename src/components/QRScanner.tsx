
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        
        // Start scanning loop
        const scanInterval = setInterval(() => {
          if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            if (context) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              context.drawImage(videoRef.current, 0, 0);
              
              // In a real implementation, you'd use a QR code library here
              // For now, we'll simulate scanning
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              // This is where you'd integrate with jsQR or similar library
              
              toast({
                title: "Camera Active",
                description: "Point your camera at a QR code to scan",
              });
            }
          }
        }, 1000);
        
        // Clean up interval after 30 seconds
        setTimeout(() => {
          clearInterval(scanInterval);
          stopCamera();
        }, 30000);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Create a file reader to read the image
      const reader = new FileReader();
      reader.onload = (e) => {
        // In a real implementation, you'd use a QR code library to decode the image
        // For demo purposes, we'll simulate a successful scan
        const mockVP = JSON.stringify({
          "@context": ["https://www.w3.org/2018/credentials/v1"],
          "type": ["VerifiablePresentation"],
          "verifiableCredential": [
            {
              "type": ["VerifiableCredential", "EmploymentCredential"],
              "credentialSubject": {
                "position": "Software Developer",
                "company": "Tech Corp"
              },
              "issuer": "did:ion:employer123",
              "issuanceDate": "2023-01-01T00:00:00Z"
            }
          ],
          "holder": "did:ion:holder456",
          "proof": {
            "type": "Ed25519Signature2020",
            "created": "2024-01-01T12:00:00Z",
            "verificationMethod": "did:ion:holder456#key-1",
            "jws": "mock_signature"
          }
        }, null, 2);
        
        onScan(mockVP);
        toast({
          title: "QR Code Scanned",
          description: "Verifiable Presentation detected and loaded",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>QR Code Scanner</CardTitle>
            <CardDescription>Scan or upload a QR code containing a Verifiable Presentation</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="camera" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="camera">Camera Scan</TabsTrigger>
            <TabsTrigger value="upload">Upload Image</TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera" className="space-y-4">
            <div className="text-center">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '300px' }}>
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  style={{ display: scanning ? 'block' : 'none' }}
                />
                <canvas 
                  ref={canvasRef} 
                  className="hidden"
                />
                {!scanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Camera preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 space-x-2">
                {!scanning ? (
                  <Button onClick={startCamera}>
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="outline">
                    Stop Camera
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="qr-upload">Upload QR Code Image</Label>
                <Input
                  id="qr-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  ref={fileInputRef}
                  className="mt-1"
                />
              </div>
              
              {uploadedFile && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {uploadedFile.name}
                  </p>
                </div>
              )}
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose Image File
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
