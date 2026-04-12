import { motion } from "motion/react";
import { FileCheck, Scale, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

const terms = [
  {
    icon: FileCheck,
    title: "Platform Use",
    body: "You may use InnovateLK to create accounts, browse patents, communicate with users, and manage commercialization activities in accordance with applicable law and platform rules.",
  },
  {
    icon: Scale,
    title: "User Responsibility",
    body: "You are responsible for the accuracy of information you upload, including patent descriptions, investment data, and profile details. Do not submit misleading, unlawful, or unauthorized content.",
  },
  {
    icon: AlertTriangle,
    title: "No Legal Guarantee",
    body: "This application helps connect stakeholders, but it does not replace legal, financial, regulatory, or patent advice. Production deployment should include your own legal review and operating terms.",
  },
];

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-purple-700 mb-4">
            <Scale className="h-4 w-4" />
            Legal Terms
          </div>
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-gray-600 text-lg">
            These terms describe the basic responsibilities for using the InnovateLK patent commercialization platform.
          </p>
        </motion.div>

        <div className="grid gap-6">
          {terms.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-purple-600" />
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-gray-700 leading-7">{item.body}</CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
