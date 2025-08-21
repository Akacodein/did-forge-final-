import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Plus,
  FileText,
  Shield,
  Users,
  Download,
  Send,
  Copy
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CredentialTemplate {
  id: string;
  name: string;
  description: string;
  schema: any;
  created_at: string;
}

interface IssuedCredential {
  id: string;
  template_name: string;
  recipient_email: string;
  credential_data: any;
  issued_at: string;
  status: string;
}

interface IssuerPortalProps {
  onBack: () => void;
  organizationName: string;
}

export const IssuerPortal = ({ onBack, organizationName }: IssuerPortalProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'issue' | 'templates' | 'issued'>('dashboard');
  const [templates, setTemplates] = useState<CredentialTemplate[]>([]);
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Issue Credential Form State
  const [newCredential, setNewCredential] = useState({
    templateName: 'Education Certificate',
    recipientName: '',
    recipientEmail: '',
    recipientDID: '',
    credentialSubject: {
      name: '',
      degree: '',
      institution: organizationName,
      gpa: '',
      graduationDate: ''
    }
  });

  // Template Creation State
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    schema: {
      type: 'EducationCredential',
      fields: ['name', 'degree', 'institution', 'gpa', 'graduationDate']
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // For now, we'll use mock data since we don't have credential tables yet
    setTemplates([
      {
        id: '1',
        name: 'Education Certificate',
        description: 'Academic degree and certification credentials',
        schema: {
          type: 'EducationCredential',
          fields: ['name', 'degree', 'institution', 'gpa', 'graduationDate']
        },
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Employment Verification',
        description: 'Work experience and employment verification',
        schema: {
          type: 'EmploymentCredential',
          fields: ['employeeName', 'position', 'company', 'startDate', 'endDate']
        },
        created_at: new Date().toISOString()
      }
    ]);

    setIssuedCredentials([
      {
        id: '1',
        template_name: 'Education Certificate',
        recipient_email: 'student@example.com',
        credential_data: {
          name: 'John Smith',
          degree: 'Bachelor of Computer Science',
          institution: organizationName,
          gpa: '3.8',
          graduationDate: '2024-05-15'
        },
        issued_at: new Date().toISOString(),
        status: 'issued'
      }
    ]);
  };

  const handleIssueCredential = async () => {
    if (!newCredential.recipientEmail || !newCredential.credentialSubject.name) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // First, find the recipient's profile by email
      const { data: recipientProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newCredential.recipientEmail)
        .single();

      if (profileError || !recipientProfile) {
        toast({
          title: "Recipient Not Found",
          description: "The recipient must have an account in the system",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create the verifiable credential
      const credentialId = `vc:${Date.now()}`;
      const credential = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "id": credentialId,
        "type": ["VerifiableCredential", "EducationCredential"],
        "issuer": {
          "id": `did:ion:issuer:${user?.id}`,
          "name": organizationName
        },
        "issuanceDate": new Date().toISOString(),
        "credentialSubject": {
          "id": newCredential.recipientDID || `did:ion:holder:${newCredential.recipientEmail}`,
          ...newCredential.credentialSubject
        },
        "proof": {
          "type": "Ed25519Signature2020",
          "created": new Date().toISOString(),
          "verificationMethod": `did:ion:issuer:${user?.id}#key-1`,
          "signatureValue": "mock-signature-value"
        }
      };

      // Save credential to database
      const { error: credentialError } = await supabase
        .from('verifiable_credentials')
        .insert({
          holder_user_id: recipientProfile.id,
          issuer_user_id: user?.id,
          credential_id: credentialId,
          credential_type: 'EducationCredential',
          credential_data: credential
        });

      if (credentialError) {
        console.error('Error saving credential:', credentialError);
        toast({
          title: "Error",
          description: "Failed to save credential to database",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Add to local state for immediate UI update
      const newIssued: IssuedCredential = {
        id: credentialId,
        template_name: newCredential.templateName,
        recipient_email: newCredential.recipientEmail,
        credential_data: newCredential.credentialSubject,
        issued_at: new Date().toISOString(),
        status: 'issued'
      };

      setIssuedCredentials(prev => [newIssued, ...prev]);

      // Download the credential as JSON
      const blob = new Blob([JSON.stringify(credential, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `credential-${newCredential.credentialSubject.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Credential Issued Successfully",
        description: `Verifiable credential issued to ${newCredential.recipientEmail}`,
      });

      // Reset form
      setNewCredential({
        templateName: 'Education Certificate',
        recipientName: '',
        recipientEmail: '',
        recipientDID: '',
        credentialSubject: {
          name: '',
          degree: '',
          institution: organizationName,
          gpa: '',
          graduationDate: ''
        }
      });

      setActiveTab('issued');
    } catch (error) {
      console.error('Error issuing credential:', error);
      toast({
        title: "Error",
        description: "Failed to issue credential",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyCredentialId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied",
      description: "Credential ID copied to clipboard",
    });
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{issuedCredentials.length}</div>
            <p className="text-xs text-muted-foreground">Verifiable credentials</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(issuedCredentials.map(c => c.recipient_email)).size}</div>
            <p className="text-xs text-muted-foreground">Unique recipients</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Recently issued credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {issuedCredentials.slice(0, 5).map((credential) => (
              <div key={credential.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{credential.template_name}</p>
                  <p className="text-sm text-muted-foreground">{credential.recipient_email}</p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-50 text-green-700">Issued</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(credential.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {issuedCredentials.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No credentials issued yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIssueCredential = () => (
    <Card>
      <CardHeader>
        <CardTitle>Issue New Credential</CardTitle>
        <CardDescription>Create and issue a verifiable credential to a recipient</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recipientName">Recipient Name *</Label>
            <Input
              id="recipientName"
              placeholder="John Smith"
              value={newCredential.credentialSubject.name}
              onChange={(e) => setNewCredential({
                ...newCredential,
                credentialSubject: { ...newCredential.credentialSubject, name: e.target.value }
              })}
            />
          </div>
          <div>
            <Label htmlFor="recipientEmail">Recipient Email *</Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="john@example.com"
              value={newCredential.recipientEmail}
              onChange={(e) => setNewCredential({ ...newCredential, recipientEmail: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="recipientDID">Recipient DID (Optional)</Label>
          <Input
            id="recipientDID"
            placeholder="did:ion:EiClkI2ByCo..."
            value={newCredential.recipientDID}
            onChange={(e) => setNewCredential({ ...newCredential, recipientDID: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Credential Details</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="degree">Degree/Certificate</Label>
              <Input
                id="degree"
                placeholder="Bachelor of Computer Science"
                value={newCredential.credentialSubject.degree}
                onChange={(e) => setNewCredential({
                  ...newCredential,
                  credentialSubject: { ...newCredential.credentialSubject, degree: e.target.value }
                })}
              />
            </div>
            <div>
              <Label htmlFor="gpa">GPA/Grade</Label>
              <Input
                id="gpa"
                placeholder="3.8"
                value={newCredential.credentialSubject.gpa}
                onChange={(e) => setNewCredential({
                  ...newCredential,
                  credentialSubject: { ...newCredential.credentialSubject, gpa: e.target.value }
                })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="graduationDate">Graduation/Completion Date</Label>
            <Input
              id="graduationDate"
              type="date"
              value={newCredential.credentialSubject.graduationDate}
              onChange={(e) => setNewCredential({
                ...newCredential,
                credentialSubject: { ...newCredential.credentialSubject, graduationDate: e.target.value }
              })}
            />
          </div>
        </div>

        <Button 
          onClick={handleIssueCredential} 
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Issuing Credential...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Issue Credential
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderIssuedCredentials = () => (
    <Card>
      <CardHeader>
        <CardTitle>Issued Credentials</CardTitle>
        <CardDescription>View and manage all issued credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {issuedCredentials.map((credential) => (
            <div key={credential.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{credential.template_name}</h3>
                  <Badge variant="secondary" className="bg-green-50 text-green-700">
                    {credential.status}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyCredentialId(credential.id)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy ID
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="font-medium">Recipient</Label>
                  <p className="text-muted-foreground">{credential.recipient_email}</p>
                </div>
                <div>
                  <Label className="font-medium">Issued Date</Label>
                  <p className="text-muted-foreground">
                    {new Date(credential.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-3">
                <Label className="font-medium">Credential Data</Label>
                <div className="bg-muted/50 rounded p-2 mt-1 text-xs">
                  <pre>{JSON.stringify(credential.credential_data, null, 2)}</pre>
                </div>
              </div>
            </div>
          ))}
          
          {issuedCredentials.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Credentials Issued Yet</h3>
              <p className="text-muted-foreground mb-4">Start issuing verifiable credentials to your recipients</p>
              <Button onClick={() => setActiveTab('issue')}>
                <Plus className="mr-2 h-4 w-4" />
                Issue First Credential
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Application
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Issuer Portal</h1>
            <p className="text-muted-foreground">{organizationName}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </Button>
        <Button
          variant={activeTab === 'issue' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('issue')}
        >
          Issue Credential
        </Button>
        <Button
          variant={activeTab === 'issued' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('issued')}
        >
          Issued Credentials
        </Button>
      </div>

      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'issue' && renderIssueCredential()}
      {activeTab === 'issued' && renderIssuedCredentials()}
    </div>
  );
};