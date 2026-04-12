import { useState } from "react";
import { Link } from "../components/ui/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { Lightbulb, TrendingUp, Factory, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    organization: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: "Innovator",
      title: "Innovator",
      description: "Showcase your patents to investors",
      icon: Lightbulb,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "Investor",
      title: "Investor",
      description: "Discover investment opportunities",
      icon: TrendingUp,
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "Manufacturer",
      title: "Manufacturer",
      description: "Find technologies to produce",
      icon: Factory,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedRole) {
      toast.error("Please select your role");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.country || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        country: formData.country,
        company: formData.organization || undefined,
        bio: `${selectedRole} passionate about innovation and technology`,
      });

      toast.success("Account created successfully! Welcome to InnovateLK.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 flex items-center justify-center p-4 py-8 sm:py-12 pt-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Back to Home */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-24 left-4 md:left-8 z-20"
      >
        <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </motion.div>

      <motion.div 
        className="w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center mb-6 sm:mb-8">
          <img src="/logo.png" alt="InnovateLK logo" className="!h-14 sm:!h-16 !w-auto max-w-[320px] object-contain" />
        </Link>

        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold">Create Your Account</CardTitle>
            <CardDescription className="text-base">
              Join the global innovation ecosystem today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-base">I am a:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <motion.button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 border-2 rounded-xl transition-all relative overflow-hidden ${
                        selectedRole === role.id
                          ? "border-blue-500 bg-blue-50 shadow-lg"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedRole === role.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                      <div className={`bg-gradient-to-br ${role.gradient} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                        <role.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-bold text-sm mb-1">{role.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{role.description}</p>
                    </motion.button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="First name"
                    className="h-11"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    className="h-11"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-11"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization (Optional)</Label>
                <Input
                  id="organization"
                  placeholder="Your company or institution"
                  className="h-11"
                  value={formData.organization}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="Your Country"
                  className="h-11"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password (min. 8 characters)"
                  className="h-11"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="h-11"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="terms"
                  className="mt-1 rounded"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">Privacy Policy</a>
                </label>
              </div>

              <Button 
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg" 
                size="lg" 
                disabled={!selectedRole || isLoading}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
