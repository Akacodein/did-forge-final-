import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search,
  FileText,
  Shield,
  Database,
  CheckCircle,
  Clock,
  AlertCircle,
  LogOut,
  User,
  Wallet,
  Building2,
  Plus,
  Star,
  Menu,
  Globe,
} from "lucide-react";
import { DIDViewer } from "@/components/DIDViewer";
import { DIDExplorer } from "@/components/DIDExplorer";
import { VerificationDashboard } from "@/components/VerificationDashboard";
import { ModernWallet } from "@/components/ModernWallet";
import { VerifierDashboard } from "@/components/VerifierDashboard";
import { IssuerApplication } from "@/components/IssuerApplication";
import { useAuth } from "@/contexts/AuthContext";
import { useStatistics } from "@/hooks/useStatistics";
import { useToast } from "@/hooks/use-toast";
import { useDIDs } from "@/hooks/useDIDs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type Profile = {
  id: string;
  role: "admin" | "issuer" | "verifier" | "holder";
};

const Index = () => {
  const [activeTab, setActiveTab] = useState("wallet");
  const [userRole, setUserRole] = useState<"holder" | "verifier" | "issuer">("holder");
  const { user, signOut, loading } = useAuth();
  const { stats, loading: statsLoading } = useStatistics();
  const { toast } = useToast();
  const { dids } = useDIDs();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  // Admin check with debug logs
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        console.warn("No user found, skipping admin check.");
        setChecking(false);
        return;
      }

      console.log("Checking admin role for user.id:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        setIsAdmin(false);
      } else {
        console.log("Fetched profile:", data);
        setIsAdmin(data?.role === "admin");
      }

      setChecking(false);
    };

    if (!loading) {
      checkAdminRole();
    }
  }, [user, loading]);

  useEffect(() => {
    console.log("AdminGuard check: loading:", loading, "checking:", checking, "user:", user, "isAdmin:", isAdmin);

    if (!loading && !checking) {
      if (!user) {
        console.log("Redirecting: No user");
        navigate("/auth");
        return;
      }

      if (!isAdmin) {
        console.log("Redirecting: User is not admin");
        navigate("/");
        return;
      }
    }
  }, [user, loading, checking, isAdmin, navigate]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      });
    }
  };

  const getRoleContent = () => {
    switch (userRole) {
      case "holder":
        return (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                My Wallet
              </TabsTrigger>
              <TabsTrigger value="viewer" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                DID Viewer
              </TabsTrigger>
              <TabsTrigger value="explorer" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Explorer
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="wallet" className="space-y-6">
                <ModernWallet />
              </TabsContent>
              <TabsContent value="viewer" className="space-y-6">
                <DIDViewer />
              </TabsContent>
              <TabsContent value="explorer" className="space-y-6">
                <DIDExplorer />
              </TabsContent>
            </div>
          </Tabs>
        );
      case "verifier":
        return <VerifierDashboard />;
      case "issuer":
        return <IssuerApplication />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-purple-900 relative overflow-hidden">
      {/* 3D Mesh Motion Effect */}
      <div className="absolute inset-0 pointer-events-none z-40">
        <div className="relative w-full h-full">
          {/* Mesh dots pattern */}
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400/80 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
            {[...Array(30)].map((_, i) => (
              <div
                key={`purple-${i}`}
                className="absolute w-1.5 h-1.5 bg-purple-400/70 rounded-full animate-pulse"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${10 + Math.random() * 40}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
          
          {/* Curved mesh lines */}
          <svg className="absolute top-0 left-0 w-full h-full opacity-50">
            <defs>
              <linearGradient id="meshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#F472B6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <path
              d="M 20 50 Q 40 30 60 50 T 100 50"
              stroke="url(#meshGradient)"
              strokeWidth="1"
              fill="none"
              className="animate-pulse"
            />
            <path
              d="M 10 80 Q 30 60 50 80 T 90 80"
              stroke="url(#meshGradient)"
              strokeWidth="1"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: "1s" }}
            />
            <path
              d="M 30 20 Q 50 0 70 20 T 110 20"
              stroke="url(#meshGradient)"
              strokeWidth="1"
              fill="none"
              className="animate-pulse"
              style={{ animationDelay: "2s" }}
            />
          </svg>
        </div>
      </div>
      
      {/* Navigation Header */}
      <div className="relative z-10">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="text-white font-bold text-xl">IDENTITY</div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window.location.href = "/admin")}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-6xl font-bold text-white leading-tight">
                  VERIFIABLE
                  <br />
                  CREDENTIALS
                  <br />
                  PLATFORM
                </h1>
              </div>
              <p className="text-xl text-gray-300 max-w-lg">
                Empowering users with self-sovereign identity and shareable verifiable credentials through Verifiable Presentations.
              </p>
            </div>
          </div>

          {/* Right Content - Glassmorphism Card */}
          <div className="relative">
            <div className="relative z-50 transform translate-x-16">
              <Card className="relative overflow-hidden w-[34rem] h-80 rounded-[28px] transform rotate-3 hover:rotate-0 transition-transform duration-500 backdrop-blur-2xl bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-slate-950/80 border border-white/15 shadow-[0_0_60px_rgba(168,85,247,0.25)]">
                {/* Subtle glass overlay */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-50"></div>

                {/* Cyan top rim line */}
                <div className="absolute left-6 right-6 top-3 h-[3px] rounded-full bg-gradient-to-r from-cyan-300/60 via-blue-300/40 to-transparent"></div>

                {/* Diagonal bottom accent line */}
                <div className="absolute left-6 right-6 bottom-20 h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent -skew-x-12"></div>

                {/* Right vertical circular icon buttons (decorative) */}
                <div className="pointer-events-none absolute top-6 right-6 flex flex-col gap-4">
                  <div className="w-10 h-10 rounded-full border border-blue-300/40 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-300" />
                  </div>
                  <div className="w-10 h-10 rounded-full border border-blue-300/40 bg-white/5 backdrop-blur-sm flex items-center justify-center">
                    <Database className="h-4 w-4 text-blue-300" />
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-8 pr-20">
                  <div className="mb-8">
                    <span className="text-blue-100 font-extrabold text-2xl tracking-wide drop-shadow-sm">IDENTITY</span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between pr-16">
                      <span className="text-blue-200/90 text-sm font-semibold tracking-wider drop-shadow-sm">DID</span>
                    </div>
                    <div className="text-blue-100 font-mono text-xl tracking-[0.35em] font-bold drop-shadow-sm">
                      1323 7645 2828 0713
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Glow behind the card - positioned further back */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-pink-400 via-purple-400 to-purple-600 rounded-full opacity-30 blur-2xl transform rotate-45 scale-125"></div>
              <div className="absolute right-10 top-10 w-60 h-60 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full opacity-40 blur-xl transform -rotate-12"></div>
            </div>
          </div>
        </div>

        {/* Role Selector Section */}
        <div className="mt-20">
          <Card className="backdrop-blur-xl bg-white/5 border-white/20 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-white">Dashboard</CardTitle>
                  <CardDescription className="text-gray-300">Choose your role to access different features</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={userRole}
                    onValueChange={(value: "holder" | "verifier" | "issuer") => setUserRole(value)}
                  >
                    <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-purple-900 border-purple-700">
                      <SelectItem value="holder">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          Holder
                        </div>
                      </SelectItem>
                      <SelectItem value="verifier">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Verifier
                        </div>
                      </SelectItem>
                      <SelectItem value="issuer">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Issuer
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <div className="mt-8">
          <Card className="backdrop-blur-xl bg-white/5 border-white/20 shadow-2xl">
            <CardContent className="p-6">{getRoleContent()}</CardContent>
          </Card>
        </div>
      </div>

      {/* Browser Overlay */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-black rounded-lg px-4 py-2 flex items-center gap-3">
          <Globe className="h-4 w-4 text-white" />
          <span className="text-white text-sm">onechain-identity.com</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
