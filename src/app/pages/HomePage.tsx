import { useEffect, useMemo, useState } from "react";
import { Link } from "../components/ui/link";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Lightbulb,
  Users,
  TrendingUp,
  Globe,
  Search,
  MessageSquare,
  Award,
  ArrowRight,
  Sparkles,
  Factory,
  Rocket,
  Shield,
  Zap,
  Target,
  CheckCircle2,
} from "lucide-react";
import { patentService, Patent, userService } from "../services";
import { motion } from "motion/react";

export function HomePage() {
  const [featuredPatents, setFeaturedPatents] = useState<Patent[]>([]);
  const [platformStats, setPlatformStats] = useState({ patents: 0, innovators: 0, investors: 0, countries: 0 });

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featured, patentStats, userStats] = await Promise.all([
          patentService.getFeaturedPatents().catch(() => []),
          patentService.getStats().catch(() => ({ total: 0 })),
          userService.getPublicStats().catch(() => ({ innovators: 0, investors: 0, countries: 0 })),
        ]);

        setFeaturedPatents((featured || []).slice(0, 3));
        setPlatformStats({
          patents: patentStats?.total || 0,
          innovators: userStats?.innovators || 0,
          investors: userStats?.investors || 0,
          countries: userStats?.countries || 0,
        });
      } catch {
        setFeaturedPatents([]);
      }
    };

    void loadHomeData();
  }, []);

  const stats = useMemo(() => ([
    { label: "Active Patents", value: platformStats.patents.toLocaleString(), icon: Award, color: "from-blue-500 to-blue-600" },
    { label: "Innovators", value: platformStats.innovators.toLocaleString(), icon: Users, color: "from-purple-500 to-purple-600" },
    { label: "Investors", value: platformStats.investors.toLocaleString(), icon: TrendingUp, color: "from-green-500 to-green-600" },
    { label: "Countries", value: platformStats.countries.toLocaleString(), icon: Globe, color: "from-orange-500 to-orange-600" },
  ]), [platformStats]);

  const features = [
    {
      icon: Search,
      title: "Discover Innovations",
      description: "Browse thousands of patented innovations across multiple technology sectors",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "AI-Powered Matching",
      description: "Get intelligent recommendations based on your investment focus and interests",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Connect & Collaborate",
      description: "Direct communication between innovators, investors, and manufacturers",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Rocket,
      title: "Track Progress",
      description: "Monitor investment opportunities and commercialization progress in real-time",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const userTypes = [
    {
      title: "For Innovators",
      description: "Showcase your patents to a global audience of investors and manufacturers",
      icon: Lightbulb,
      link: "/register",
      gradient: "from-blue-500 to-blue-600",
      benefits: ["Global Exposure", "Secure Platform", "Direct Connections"],
    },
    {
      title: "For Investors",
      description: "Discover investment-ready innovations with verified patent protection",
      icon: TrendingUp,
      link: "/register",
      gradient: "from-green-500 to-emerald-600",
      benefits: ["Vetted Patents", "Market Insights", "ROI Tracking"],
    },
    {
      title: "For Manufacturers",
      description: "Find licensed technologies ready for commercial production",
      icon: Factory,
      link: "/register",
      gradient: "from-purple-500 to-purple-600",
      benefits: ["Production Ready", "Licensing Support", "Quality Tech"],
    },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  };

  const staggerContainer = {
    initial: {},
    whileInView: { transition: { staggerChildren: 0.1 } },
    viewport: { once: true, margin: "-100px" }
  };

  return (
    <div className="flex flex-col pt-16 lg:pt-[70px]">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.BASE_URL}hero.jpg`}
            alt="Sri Lanka landscape"
            className="absolute inset-0 !h-full !w-full object-cover object-center opacity-65 saturate-75 brightness-85 contrast-95 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-blue-900/38 to-blue-800/30" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
          <motion.div
            className="hidden sm:block absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl"
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
          <motion.div
            className="hidden sm:block absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-28 lg:py-36 relative">
          <motion.div 
            className="max-w-5xl mx-auto text-center space-y-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-block"
            >
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                Verified Patent Commercialization
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Transform Patents into
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300 bg-clip-text text-transparent">
                Global Success
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl lg:text-2xl text-blue-50 max-w-3xl mx-auto px-4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              A secure, AI-driven platform connecting patent holders with investors 
              and manufacturers for commercialization opportunities
            </motion.p>
            
            <motion.div 
              className="flex flex-row gap-3 sm:gap-4 justify-center items-center px-4 pt-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.7 }}
            >
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 px-7 sm:px-8 py-6 text-base font-semibold min-w-[170px] sm:min-w-[190px] group" 
                asChild
              >
                <Link to="/browse">
                  Explore Patents
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md transition-all duration-300 px-7 sm:px-8 py-6 text-base min-w-[170px] sm:min-w-[190px]" 
                asChild
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L1440 120L1440 0C1440 0 1080 80 720 80C360 80 0 0 0 0L0 120Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 md:py-24 -mt-1 bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-100/40 blur-3xl rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-100/40 blur-3xl rounded-full" />
        </div>
        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {stats.map((stat, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-[0_12px_30px_rgb(15,23,42,0.06)] hover:shadow-[0_16px_40px_rgb(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${stat.color}`} />
                  <CardContent className="pt-7 pb-7 text-center">
                    <div className={`w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md ring-4 ring-white group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                    </div>
                    <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-1">{stat.value}</div>
                    <div className="text-xs md:text-sm text-slate-600 font-semibold uppercase tracking-wide">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-white via-slate-50/60 to-slate-100/40">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            {...fadeInUp}
          >
            <Badge className="mb-4 px-4 py-2 bg-blue-50/90 text-blue-700 border-blue-200 shadow-sm">
              Our Solutions
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-900">Who We Serve</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              A unified platform for all stakeholders in the innovation ecosystem
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {userTypes.map((type, index) => (
              <motion.div key={index} {...fadeInUp}>
                <Card className="h-full rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_12px_30px_rgb(15,23,42,0.06)] hover:shadow-[0_20px_50px_rgb(15,23,42,0.14)] transition-all duration-500 hover:-translate-y-2 group overflow-hidden relative">
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${type.gradient}`} />
                  <CardContent className="pt-8 pb-8 px-6">
                    <div className={`w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shadow-md ring-4 ring-white group-hover:scale-110 transition-transform duration-300`}>
                      <type.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 text-slate-900">{type.title}</h3>
                    <p className="text-base text-slate-600 mb-6 leading-relaxed">{type.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {type.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full bg-gradient-to-r ${type.gradient} hover:opacity-95 shadow-lg hover:shadow-xl group`}
                      asChild
                    >
                      <Link to={type.link}>
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={`${import.meta.env.BASE_URL}1.jpeg`}
            alt="Innovation background"
            className="absolute inset-0 !h-full !w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/72 via-blue-900/62 to-blue-800/55" />
          <div className="absolute inset-0 opacity-12 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')]"></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="text-center mb-12 md:mb-16"
            {...fadeInUp}
          >
            <Badge className="mb-4 px-4 py-2 bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto px-4">
              Powerful tools designed to accelerate innovation commercialization
            </p>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="text-center group"
                {...fadeInUp}
              >
                <div className="relative mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    <feature.icon className="w-10 h-10 text-white" strokeWidth={1.5} color="white" />
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-base text-blue-100 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Patents */}
      <section className="py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 md:mb-12 gap-4"
            {...fadeInUp}
          >
            <div>
              <Badge className="mb-3 px-4 py-2 bg-blue-50 text-blue-600 border-blue-200">
                Featured
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Innovations</h2>
              <p className="text-base md:text-lg text-gray-600">
                Explore trending patents from Sri Lanka and around the world
              </p>
            </div>
            <Button variant="outline" size="lg" asChild className="w-full lg:w-auto border-2">
              <Link to="/browse">
                View All Patents
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
          
          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {featuredPatents.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <Card className="border-dashed shadow-none">
                <CardContent className="py-12 text-center text-gray-500">Featured patents will appear here once approved and marked as featured by an admin.</CardContent>
              </Card>
            </div>
          ) : featuredPatents.map((patent: any) => (
              <motion.div key={patent._id || patent.id} {...fadeInUp}>
                <Card className="h-full border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden group">
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-blue-100 to-blue-50">
                    <img 
                      src={patent.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"} 
                      alt={patent.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="pt-6 pb-6 flex flex-col gap-4">
                    <Badge className="w-fit bg-blue-50 text-blue-600 border-blue-200 font-medium">
                      {patent.category}
                    </Badge>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-bold text-lg md:text-xl line-clamp-2 leading-tight">
                        {patent.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {patent.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Globe className="w-4 h-4" />
                        <span>{patent.innovatorCountry || patent.innovator?.country || "Global"}</span>
                      </div>
                      <span className="font-bold text-blue-600">{patent.fundingRequired}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md" asChild>
                      <Link to={`/patent/${patent._id || patent.id}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-900 text-white relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          className="absolute top-10 right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-10 left-10 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="container mx-auto px-4 relative">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            {...fadeInUp}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
              Ready to Transform Your Innovation?
            </h2>
            <p className="text-lg md:text-xl mb-8 md:mb-10 text-blue-100 max-w-2xl mx-auto px-4 leading-relaxed">
              Join thousands of innovators, investors, and manufacturers on the world's leading 
              patent commercialization platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl px-8 py-6 text-base font-semibold w-full sm:w-auto" 
                asChild
              >
                <Link to="/register">Create Account</Link>
              </Button>
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-md transition-all duration-300 px-8 py-6 text-base w-full sm:w-auto" 
                asChild
              >
                <Link to="/ai-chatbot">Ask the AI Assistant</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
