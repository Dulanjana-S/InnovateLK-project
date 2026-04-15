import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { motion } from "motion/react";
import {
  HelpCircle,
  Search,
  MessageCircle,
  Mail,
  Phone,
  Book,
  Video,
  FileText,
  Send,
  CheckCircle2,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { Link } from "../components/ui/link";
import { supportService, SupportTicket } from "../services";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export function HelpSupportPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [contactForm, setContactForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    setContactForm((prev) => ({
      ...prev,
      name: user?.name || prev.name,
      email: user?.email || prev.email,
    }));
  }, [user?.name, user?.email]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const loadTickets = async () => {
      try {
        setLoadingTickets(true);
        const data = await supportService.getMyTickets();
        setTickets(data);
      } catch (_error) {
        // Silent for users without auth tokens or no tickets.
      } finally {
        setLoadingTickets(false);
      }
    };
    void loadTickets();
  }, [isAuthenticated]);
  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I create an account on InnovateLK?",
          answer: "Open Register, choose your role, fill in your details, and sign in once the account is created.",
        },
        {
          question: "What roles can join the platform?",
          answer: "Innovator, Investor, and Manufacturer accounts are supported throughout the app.",
        },
        {
          question: "Can I update my profile later?",
          answer: "Yes. Use Profile Settings to change company details, bio, contact info, and preferences.",
        },
      ],
    },
    {
      category: "Patents & Deals",
      questions: [
        {
          question: "How do I upload a patent?",
          answer: "Go to Upload Patent, complete the form, and submit it as an Innovator account.",
        },
        {
          question: "How do investments work?",
          answer: "Investors and manufacturers can send structured proposals in Investments & Deals. Innovators review pending proposals there, approve or decline them, and then manage active deal milestones in the same workspace.",
        },
        {
          question: "Where can I see notifications?",
          answer: "Open Notifications to see new interest, investment updates, and incoming messages.",
        },
      ],
    },
    {
      category: "Security & Access",
      questions: [
        {
          question: "How do I reset my password?",
          answer: "Use the Forgot Password page to generate a reset link. In development, the link can be shown directly on screen when email is not configured.",
        },
        {
          question: "Are messages private?",
          answer: "The updated project restricts message and conversation access to conversation participants only.",
        },
      ],
    },
  ];

  const resources = [
    {
      title: "Getting Started",
      description: "Browse patents and learn the main app flows.",
      icon: Book,
      href: "/browse",
      badge: "Guide",
      external: false,
    },
  
    {
      title: "AI Assistant",
      description: "Try the built-in AI helper and patent matching tools.",
      icon: Video,
      href: "/ai-chatbot",
      badge: "AI",
      external: false,
    },
  ];

  const filteredFaqs = useMemo(
    () =>
      faqs
        .map((category) => ({
          ...category,
          questions: category.questions.filter(
            (q) =>
              searchQuery === "" ||
              q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        }))
        .filter((category) => category.questions.length > 0),
    [searchQuery],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in before creating a support ticket");
      return;
    }
    try {
      setSubmitting(true);
      const created = await supportService.submitTicket(contactForm);
      toast.success("Support ticket submitted successfully");
      setTickets((prev) => [created, ...prev]);
      setContactForm({
        name: user?.name || "",
        email: user?.email || "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to submit support ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Search FAQs, open a support ticket, or jump straight into a platform resource.
          </p>
        </motion.div>

        <motion.div className="max-w-2xl mx-auto mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg"
            />
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">Email Support</h3>
              <p className="text-sm text-gray-600 mb-3">info@innovatelk.com</p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <a href="mailto:info@innovatelk.com">Send Email</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">Phone Support</h3>
              <p className="text-sm text-gray-600 mb-3">+94 11 234 5678</p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <a href="tel:+94112345678">Call Us</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">Direct Messages</h3>
              <p className="text-sm text-gray-600 mb-3">Use in-app messaging to continue active discussions</p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link to="/messages">Open Messages</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs defaultValue="faq" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find quick answers to common questions</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFaqs.length > 0 ? (
                  <div className="space-y-6">
                    {filteredFaqs.map((category) => (
                      <div key={category.category}>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-blue-600" />
                          {category.category}
                        </h3>
                        <Accordion type="single" collapsible className="space-y-2">
                          {category.questions.map((item, qIndex) => (
                            <AccordionItem key={`${category.category}-${qIndex}`} value={`${category.category}-${qIndex}`}>
                              <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                              <AccordionContent className="text-gray-600">{item.answer}</AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">No FAQs found matching "{searchQuery}"</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Help Resources</CardTitle>
                <CardDescription>Guides, docs, and quick routes into the app</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((resource) => {
                    const Icon = resource.icon;
                    const content = (
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{resource.title}</h3>
                              <Badge variant="secondary" className="text-xs">{resource.badge}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{resource.description}</p>
                          </div>
                        </div>
                      </div>
                    );

                    return resource.external ? (
                      <a key={resource.title} href={resource.href} className="block" target="_blank" rel="noreferrer">
                        {content}
                      </a>
                    ) : (
                      <Link key={resource.title} to={resource.href} className="block">
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Submit a support ticket and track it from your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" value={contactForm.subject} onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" rows={6} value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required />
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                      {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                      Submit Ticket
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Recent Tickets</CardTitle>
                  <CardDescription>{isAuthenticated ? "Recent tickets from your signed-in account" : "Sign in to view your support history"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!isAuthenticated ? (
                    <div className="rounded-xl border bg-blue-50 p-4 text-sm text-blue-900">
                      Sign in to track ticket history and link support requests to your account.
                    </div>
                  ) : loadingTickets ? (
                    <div className="py-10 text-center text-gray-500">
                      <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin" />
                      Loading tickets...
                    </div>
                  ) : tickets.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-6 text-center text-gray-500">No support tickets yet.</div>
                  ) : (
                    tickets.slice(0, 5).map((ticket) => (
                      <div key={ticket._id} className="rounded-xl border p-4 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium line-clamp-1">{ticket.subject}</p>
                          <Badge variant={ticket.status === "resolved" ? "secondary" : "default"}>{ticket.status.replace("_", " ")}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{ticket.message}</p>
                        <p className="text-xs text-gray-500">Submitted {new Date(ticket.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <motion.div className="mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-semibold text-lg mb-2">Need Immediate Assistance?</h3>
              <p className="text-gray-600 mb-4">Our support team is available Monday to Friday, 9:00 AM to 5:00 PM IST</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild>
                  <a href="tel:+94112345678"><Phone className="mr-2 h-4 w-4" />Call +94 11 234 5678</a>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/messages"><MessageCircle className="mr-2 h-4 w-4" />Open Messages</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
