
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { 
  QrCode, 
  Copy, 
  ExternalLink, 
  Key, 
  Globe, 
  Database,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type DID = Tables<'dids'>;
type IONOperation = Tables<'ion_operations'>;
type IPFSPin = Tables<'ipfs_pins'>;
type Verification = Tables<'verifications'>;

interface DIDWithDetails extends DID {
  ion_operations: IONOperation[];
  ipfs_pins: IPFSPin[];
  verifications: Verification[];
}

interface DIDDetailsProps {
  didId: string;
}

export const DIDDetails = ({ didId }: DIDDetailsProps) => {
  const [didData, setDidData] = useState<DIDWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    fetchDIDDetails();
  }, [didId]);

  const fetchDIDDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dids')
        .select(`
          *,
          ion_operations (*),
          ipfs_pins (*),
          verifications (*)
        `)
        .eq('id', didId)
        .single();

      if (error) throw error;

      setDidData(data as DIDWithDetails);
      
      // Generate QR code URL using a public service
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.did_identifier)}`;
      setQrCodeUrl(qrUrl);

    } catch (err) {
      console.error('Error fetching DID details:', err);
      toast({
        title: "Error",
        description: "Failed to load DID details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'anchored':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
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
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!didData) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        DID not found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              DID Details
            </CardTitle>
            {getStatusBadge(didData.status)}
          </div>
          <CardDescription>
            Created on {new Date(didData.created_at).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <code className="flex-1 text-sm font-mono break-all">{didData.did_identifier}</code>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => copyToClipboard(didData.did_identifier, "DID")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      {qrCodeUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code
            </CardTitle>
            <CardDescription>
              Scan to share your DID
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <img 
              src={qrCodeUrl} 
              alt="DID QR Code" 
              className="border rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* DID Document */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            DID Document
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">JSON-LD</Badge>
            <Badge variant="outline">
              {didData.ipfs_pins?.length || 0} IPFS Pin(s)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={JSON.stringify(didData.did_document, null, 2)}
            readOnly
            className="font-mono text-xs min-h-[300px]"
          />
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline"
              onClick={() => copyToClipboard(JSON.stringify(didData.did_document, null, 2), "DID Document")}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* IPFS Information */}
      {didData.ipfs_pins && didData.ipfs_pins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              IPFS Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {didData.ipfs_pins.map((pin) => (
                <div key={pin.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{pin.pin_status}</Badge>
                    {pin.gateway_url && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={pin.gateway_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">IPFS Hash</p>
                    <code className="text-xs bg-muted p-2 rounded block mt-1 break-all">{pin.ipfs_hash}</code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ION Operations */}
      {didData.ion_operations && didData.ion_operations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ION Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {didData.ion_operations.map((operation) => (
                <div key={operation.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{operation.operation_type}</Badge>
                    {getStatusBadge(operation.status)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Created</p>
                      <p className="text-muted-foreground">
                        {new Date(operation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {operation.transaction_id && (
                      <div>
                        <p className="font-medium">Transaction ID</p>
                        <code className="text-xs break-all">{operation.transaction_id}</code>
                      </div>
                    )}
                    {operation.block_height && (
                      <div>
                        <p className="font-medium">Block Height</p>
                        <p className="text-muted-foreground">{operation.block_height}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
