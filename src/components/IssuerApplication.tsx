
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Building2, 
  Mail, 
  Globe, 
  Shield, 
  CheckCircle,
  Clock,
  AlertCircle,
  Send
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { IssuerPortal } from "./IssuerPortal";

interface ApplicationData {
  id?: string;
  full_name: string;
  email: string;
  website_url: string;
  dns_verification: boolean;
  email_verification: boolean;
  status: "pending" | "approved" | "rejected";
  created_at?: string;
}

export const IssuerApplication = () => {
  const [formData, setFormData] = useState<ApplicationData>({
    full_name: "",
    email: "",
    website_url: "",
    dns_verification: false,
    email_verification: true,
    status: "pending"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPortal, setShowPortal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExistingApplication();
    }
  }, [user]);

  const fetchExistingApplication = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('issuer_applications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching application:', error);
        toast({
          title: "Error",
          description: "Failed to fetch existing application",
          variant: "destructive"
        });
      } else if (data) {
        setFormData({
          id: data.id,
          full_name: data.full_name,
          email: data.email,
          website_url: data.website_url || "",
          dns_verification: data.dns_verification,
          email_verification: data.email_verification,
          status: data.status,
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Enhanced authentication check
    if (!user) {
      console.error('No authenticated user found');
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit an issuer application.",
        variant: "destructive",
      });
      return;
    }

    // Verify session is active
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('Session verification failed:', sessionError);
      toast({
        title: "Session Expired",
        description: "Please sign in again to submit your application.",
        variant: "destructive",
      });
      return;
    }

    console.log('Submitting application with authenticated user:', {
      userId: user.id,
      userEmail: user.email,
      hasActiveSession: !!session,
      sessionAccessToken: session.access_token ? 'present' : 'missing'
    });

    setIsSubmitting(true);
    
    try {
      const applicationData = {
        user_id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        website_url: formData.website_url,
        dns_verification: formData.dns_verification,
        email_verification: formData.email_verification,
        status: 'pending'
      };

      console.log('Inserting application data:', applicationData);
      
      const { data, error } = await supabase
        .from('issuer_applications')
        .insert(applicationData)
        .select();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Application submitted successfully:', data);

      toast({
        title: "Application Submitted",
        description: "Your issuer application has been submitted for review",
      });

      fetchExistingApplication();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetApplication = async () => {
    if (formData.id) {
      try {
        const { error } = await (supabase as any)
          .from('issuer_applications')
          .delete()
          .eq('id', formData.id);

        if (error) throw error;
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }

    setFormData({
      full_name: "",
      email: "",
      website_url: "",
      dns_verification: false,
      email_verification: true,
      status: "pending"
    });
  };

  const getStatusBadge = () => {
    switch (formData.status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (formData.status === "approved") {
    if (showPortal) {
      return (
        <IssuerPortal 
          onBack={() => setShowPortal(false)} 
          organizationName={formData.full_name} 
        />
      );
    }

    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Issuer Account Approved
            </CardTitle>
            <CardDescription>
              You can now issue verifiable credentials on behalf of your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Organization</Label>
                  <p className="text-sm text-muted-foreground">{formData.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Official Email</Label>
                  <p className="text-sm text-muted-foreground">{formData.email}</p>
                </div>
              </div>
              
              <div className="pt-4 flex gap-2">
                <Button className="flex-1" onClick={() => setShowPortal(true)}>
                  <Building2 className="mr-2 h-4 w-4" />
                  Access Issuer Portal
                </Button>
                <Button variant="outline" onClick={resetApplication}>
                  Submit New Application
                </Button>
              </div>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Apply to Become an Issuer
              </CardTitle>
              <CardDescription>
                Issue verifiable credentials on behalf of your organization
              </CardDescription>
            </div>
            {formData.status && getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          {formData.status === "pending" && formData.id ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Application Under Review</h3>
              <p className="text-muted-foreground mb-6">
                Your application is being reviewed by our team. You will receive an email notification once approved.
              </p>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Organization</Label>
                    <p className="text-muted-foreground">{formData.full_name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Email</Label>
                    <p className="text-muted-foreground">{formData.email}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={resetApplication}>
                  Submit New Application
                </Button>
              </div>
            </div>
          ) : formData.status === "rejected" ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Application Rejected</h3>
              <p className="text-muted-foreground mb-6">
                Your application was not approved. Please review the requirements and submit a new application.
              </p>
              <div className="mt-4">
                <Button onClick={resetApplication}>
                  Submit New Application
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orgName">Organization Name *</Label>
                  <Input
                    id="orgName"
                    placeholder="e.g., Acme Corporation"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Official Email (Work Email) *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g., credentials@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be a work email from your organization's domain
                  </p>
                </div>

                <div>
                  <Label htmlFor="website">Website URL</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://acme.com"
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Verification Method</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="email-verify"
                        checked={formData.email_verification}
                        onCheckedChange={(checked) => setFormData({...formData, email_verification: checked as boolean})}
                      />
                      <Label htmlFor="email-verify" className="text-sm">
                        Email verification (we'll send a verification email)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="dns-verify"
                        checked={formData.dns_verification}
                        onCheckedChange={(checked) => setFormData({...formData, dns_verification: checked as boolean})}
                      />
                      <Label htmlFor="dns-verify" className="text-sm">
                        DNS verification (I can add a TXT record to verify domain ownership)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Verification Process</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll verify your organization through email confirmation and domain validation. 
                      Applications are reviewed by our admin team.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Application
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
