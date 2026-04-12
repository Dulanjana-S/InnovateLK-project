import { motion } from "motion/react";
import { Shield, Lock, Database, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const sections = [
  {
    icon: Database,
    title: "Information We Collect",
    points: [
      "Account details such as your name, email address, role, country, and optional company information.",
      "Patent listings, investment records, messages, and profile data that you submit through the platform.",
      "Basic technical logs required to operate the application securely and diagnose issues.",
    ],
  },
  {
    icon: Lock,
    title: "How We Use Your Data",
    points: [
      "To provide authentication, patent discovery, messaging, analytics, and other platform features.",
      "To connect innovators, investors, and manufacturers based on your actions and preferences.",
      "To protect the service, investigate abuse, and improve product quality.",
    ],
  },
  {
    icon: Shield,
    title: "Data Protection",
    points: [
      "Passwords are stored as secure hashes and protected routes require authenticated access.",
      "Access to your data is limited to the application workflows and authorized system administrators.",
      "You are responsible for protecting your account credentials and using strong passwords.",
    ],
  },
];

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700 mb-4">
            <Shield className="h-4 w-4" />
            Privacy & Data Use
          </div>
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">
            This policy explains how InnovateLK handles account, patent, message, and platform usage data.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {sections.map((section, index) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <section.icon className="h-5 w-5 text-blue-600" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-700">
                    {section.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-blue-500" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-purple-600" />
                Questions About Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700">
              Contact the platform administrator or project owner before production deployment to customize this policy for your hosting, legal, and compliance requirements.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
