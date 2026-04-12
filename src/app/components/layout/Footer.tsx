import { Link } from "../ui/link";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";
import { motion } from "motion/react";

export function Footer() {
  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] " />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <motion.div 
            className="space-y-4 lg:col-span-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img src="/logo.png" alt="InnovateLK logo" className="!h-12 !w-auto max-w-[230px] object-contain" />
            <p className="text-sm leading-relaxed text-gray-400">
              Connecting innovators with investors and manufacturers globally. 
              Empowering Sri Lankan innovation on the world stage.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 flex items-center justify-center transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="font-bold text-white mb-5 text-base md:text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/browse" 
                  className="hover:text-blue-400 transition-colors inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                  Browse Patents
                </Link>
              </li>
              <li>
                <Link 
                  to="/ai-chatbot" 
                  className="hover:text-blue-400 transition-colors inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                  AI Assistant
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="hover:text-blue-400 transition-colors inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/register" 
                  className="hover:text-blue-400 transition-colors inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                  Get Started
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* For Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="font-bold text-white mb-5 text-base md:text-lg">For Users</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link 
                  to="/innovator-dashboard" 
                  className="hover:text-blue-400 transition-colors inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                  For Innovators
                </Link>
              </li>
              <li>
                <Link 
                  to="/investor-dashboard" 
                  className="hover:text-blue-400 transition-colors inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                  For Investors
                </Link>
              </li>
              <li>
                <Link 
                  to="/manufacturer-dashboard" 
                  className="hover:text-blue-400 transition-colors inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                  For Manufacturers
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="hover:text-blue-400 transition-colors inline-flex items-center group"
                >
                  <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                  Help & Support
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="font-bold text-white mb-5 text-base md:text-lg">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-blue-600 flex items-center justify-center flex-shrink-0 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors">
                  National Innovation Centre, Colombo 07, Sri Lanka
                </span>
              </li>
              <li className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-blue-600 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <a 
                  href="mailto:info@innovatelk.com" 
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  info@innovatelk.com
                </a>
              </li>
              <li className="flex items-center space-x-3 group">
                <div className="w-8 h-8 rounded-lg bg-gray-800 group-hover:bg-blue-600 flex items-center justify-center flex-shrink-0 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <a 
                  href="tel:+94112345678" 
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  +94 11 234 5678
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div 
          className="border-t border-gray-800 mt-12 pt-8 text-xs md:text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">
              &copy; 2026 InnovateLK Patent Commercialization Platform. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-400">
              <Link to="/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
          <p className="mt-4 text-gray-500 text-center">
            Powered by AI | Connecting Global Innovation Ecosystem
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
