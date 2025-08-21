
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  Building2,
  Mail,
  Globe,
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Define types for our new tables since they're not in the generated types yet
interface IssuerApplication {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  website_url: string;
  dns_verification: boolean;
  email_verification: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  profiles?: {
    email: string;
    full_name: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const AdminDashboard = () => {
  const [applications, setApplications] = useState<IssuerApplication[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchApplications();
    fetchUsers();
  }, []);

  const fetchApplications = async () => {
    try {
      // First, get the applications
      const { data: applications, error: appsError } = await (supabase as any)
        .from('issuer_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (appsError) throw appsError;

      // Then get the profiles for each application
      const applicationsWithProfiles = [];
      for (const app of applications || []) {
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('email, full_name')
          .eq('id', app.user_id)
          .single();
        
        applicationsWithProfiles.push({
          ...app,
          profiles: profile
        });
      }

      setApplications(applicationsWithProfiles);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'approved' | 'rejected') => {
    setProcessingId(applicationId);
    
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      // Update application status
      const { error: appError } = await (supabase as any)
        .from('issuer_applications')
        .update({
          status: action,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (appError) throw appError;

      // If approved, update user role to issuer
      if (action === 'approved') {
        const { error: roleError } = await (supabase as any)
          .from('profiles')
          .update({ role: 'issuer' })
          .eq('id', application.user_id);

        if (roleError) throw roleError;
      }

      toast({
        title: "Success",
        description: `Application ${action} successfully`,
      });

      // Refresh data
      fetchApplications();
      fetchUsers();
    } catch (error) {
      console.error('Error processing application:', error);
      toast({
        title: "Error",
        description: "Failed to process application",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await (supabase as any)
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      issuer: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      verifier: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      holder: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    };

    return (
      <Badge variant="secondary" className={roleColors[role as keyof typeof roleColors] || roleColors.holder}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const recentApplications = applications.filter(app => app.status !== 'pending').slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage issuer applications and user roles
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingApplications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Issuers</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'issuer').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Verifiers</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'verifier').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Issuer Applications
          </CardTitle>
          <CardDescription>
            Review and approve issuer applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApplications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending applications
            </p>
          ) : (
            <div className="space-y-4">
              {pendingApplications.map((app) => (
                <div key={app.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {app.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {app.email}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Applicant</p>
                      <p>{app.profiles?.full_name || app.profiles?.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Applied</p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {app.website_url && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Website</p>
                      <p className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        {app.website_url}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleApplicationAction(app.id, 'approved')}
                      disabled={processingId === app.id}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleApplicationAction(app.id, 'rejected')}
                      disabled={processingId === app.id}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Role Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Role Management
          </CardTitle>
          <CardDescription>
            Manage user roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{user.full_name || user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  {getRoleBadge(user.role)}
                  <Select
                    value={user.role}
                    onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="holder">Holder</SelectItem>
                      <SelectItem value="verifier">Verifier</SelectItem>
                      <SelectItem value="issuer">Issuer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      {recentApplications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Recently processed applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{app.full_name}</p>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
