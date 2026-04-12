import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ArrowLeft, CheckCircle, Key, Lightbulb, Users } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { Link } from "../components/ui/link";
import { toast } from "sonner";

const demoUsers = [
  {
    id: "innovator",
    name: "Dr. Rajesh Kumar",
    email: "innovator@example.com",
    password: "password123",
    role: "Innovator",
    country: "Sri Lanka",
    bio: "Tech innovator passionate about AI and renewable energy solutions",
    company: "TechVentures LK",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh"
  },
  {
    id: "investor",
    name: "Sarah Williams",
    email: "investor@example.com",
    password: "password123",
    role: "Investor",
    country: "United States",
    bio: "Venture capitalist investing in emerging tech and sustainable innovation",
    company: "Global Ventures Capital",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    id: "manufacturer",
    name: "Michael Chen",
    email: "manufacturer@example.com",
    password: "password123",
    role: "Manufacturer",
    country: "China",
    bio: "Manufacturing expert specializing in IoT and electronics production",
    company: "Chen Manufacturing Ltd",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
  },
  {
    id: "admin",
    name: "Platform Admin",
    email: "admin@innovatelk.local",
    password: "password123",
    role: "Admin",
    country: "Sri Lanka",
    bio: "Single platform administrator for moderation, oversight, and reporting",
    company: "InnovateLK",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
  },
];

export function DemoAccountsPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email: string, password: string, name: string, role: string) => {
    try {
      await login(email, password);
      toast.success(`Logged in as ${name}`);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || `Unable to login as ${role}. Seed the backend first.`);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "Innovator":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Investor":
        return "bg-green-100 text-green-700 border-green-200";
      case "Manufacturer":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Admin":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 pt-20 pb-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="mb-8">
          <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
            <Link to="/login">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Demo User Accounts</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Use these seeded accounts to test each role. Make sure you run the backend seed script first.
          </p>
        </motion.div>

        <Card className="mb-8 border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                <Key className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Universal Password</CardTitle>
                <CardDescription className="text-base">All demo accounts use the same password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-lg p-6 border-2 border-yellow-300 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Password for all accounts:</p>
                <p className="text-2xl font-mono font-bold text-gray-900">password123</p>
              </div>
              <CheckCircle className="w-12 h-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demoUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
            >
              <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/95 hover:shadow-2xl transition-all duration-300 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-xl border-2 border-gray-200" />
                    <Badge className={`${getRoleBadgeColor(user.role)} border`}>{user.role}</Badge>
                  </div>
                  <CardTitle className="text-xl">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Lightbulb className="w-4 h-4" />
                    <span className="truncate">{user.company}</span>
                  </div>
                  <div className="text-sm text-gray-500">{user.country}</div>
                  <Button
                    onClick={() => handleQuickLogin(user.email, user.password, user.name, user.role)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    Login as {user.role}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
