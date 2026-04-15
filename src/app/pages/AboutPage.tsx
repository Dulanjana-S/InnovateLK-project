import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Lightbulb, 
  Target, 
  Users, 
  Globe, 
  TrendingUp,
  Shield,
  Zap,
  Heart,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";

export function AboutPage() {
  const features = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with innovators, investors, and manufacturers from 45+ countries worldwide",
    },
    {
      icon: Shield,
      title: "Verified Patents",
      description: "All patents are verified and linked to official registration databases",
    },
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Advanced AI matching technology connects the right stakeholders efficiently",
    },
    {
      icon: Heart,
      title: "Impact Focused",
      description: "Supporting innovation that drives economic growth and solves real problems",
    },
  ];

  const stats = [
    { value: "2,547", label: "Active Patents" },
    { value: "1,234", label: "Innovators" },
    { value: "LKR 125M", label: "Funding Facilitated" },
    { value: "45+", label: "Countries" },
  ];

  const team = [
    
    { name: "TBA", role: "HR", expertise: "Human Resources" },
        { name: "Mr. Widana Mathisha ", role: "Founder", expertise: "InnovateLK Patent Commercialization Platform" },

    { name: "TBA", role: "Manager", expertise: "Investment & VC Relations" },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-white/20 text-white border-white/30 mb-4">
              About InnovateLK
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Transforming Innovation into Reality
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
              We're on a mission to bridge the gap between brilliant innovations and the resources 
              needed to bring them to market, starting from Sri Lanka and reaching the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold">Our Mission</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    To create a unified global platform that connects patent holders with investors 
                    and manufacturers, enabling innovations to reach their full commercial potential. 
                    We believe every brilliant idea deserves the opportunity to make an impact.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold">Our Vision</h2>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    A world where geographical boundaries don't limit innovation, where brilliant 
                    minds from developing nations like Sri Lanka can access global resources, and 
                    where transformative technologies find their path to market seamlessly.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">The Problem We Solve</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Despite growing patent filings globally, many innovations remain unutilized
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              { value: "70%", text: "Of patents filed globally remain dormant or unutilized due to lack of commercialization pathways", borderClass: "border-red-200", textClass: "text-red-600" },
              { value: "LKR 2.5T", text: "Worth of intellectual property sits unrealized, representing lost economic opportunities worldwide", borderClass: "border-orange-200", textClass: "text-orange-600" },
              { value: "Limited", text: "Access to investors and manufacturers for innovators in developing countries, leading to brain drain", borderClass: "border-blue-200", textClass: "text-blue-600" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={item.borderClass}>
                  <CardContent className="pt-6">
                    <div className={`text-3xl sm:text-4xl font-bold mb-2 ${item.textClass}`}>{item.value}</div>
                    <p className="text-gray-700">
                      {item.text}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Why Choose InnovateLK</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              We provide everything needed to successfully commercialize innovations
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm sm:text-base text-blue-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sri Lanka Focus */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              className="text-center mb-8 sm:mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Rooted in Sri Lanka, Reaching the World</h2>
              <p className="text-lg sm:text-xl text-gray-600">
                Empowering Sri Lankan innovation on the global stage
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="text-gray-700">
                  InnovateLK was born from a vision to prevent brain drain and unlock the 
                  potential of Sri Lankan innovators. We understand the unique challenges faced 
                  by inventors in developing nations and have built our platform to address them.
                </p>
                <p className="text-gray-700">
                  By providing equal access to global investors and manufacturers, we're creating 
                  opportunities for local innovations to thrive without requiring inventors to 
                  leave their homeland.
                </p>
                <div className="flex items-center gap-2 pt-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Supporting local innovation ecosystem</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Creating economic opportunities in Sri Lanka</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">Preventing talent and idea migration</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-2">🇱🇰</div>
                      <h3 className="font-bold text-xl">Made in Sri Lanka</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sri Lankan Patents</span>
                        <span className="font-semibold">850+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Local Innovators</span>
                        <span className="font-semibold">420+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Funding to SL Innovations</span>
                        <span className="font-semibold">LKR 45M+</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Success Rate</span>
                        <span className="font-semibold">68%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Leadership Team</h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Experienced professionals passionate about innovation
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <CardContent className="pt-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-blue-600">
                      {member.name.charAt(0)}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                    <p className="text-sm text-blue-600 mb-2">{member.role}</p>
                    <p className="text-xs text-gray-600">{member.expertise}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Ready to Join the Innovation Revolution?
            </h2>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 max-w-2xl mx-auto px-4">
              Whether you're an innovator, investor, or manufacturer, there's a place for you 
              in our global ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 w-full sm:w-auto" asChild>
                <Link to="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto" asChild>
                <Link to="/browse">Browse Patents</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}