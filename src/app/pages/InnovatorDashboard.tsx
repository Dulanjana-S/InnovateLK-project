import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Eye, FileText, Heart, MessageSquare, Plus, Search, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { usePatents } from "../hooks/usePatents";
import { chatService, investmentService, patentService, type Investment } from "../services";
import { getDashboardPathForRole } from "../utils/roleRouting";

const moderationBadge: Record<string, string> = {
  pending_review: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

export function InnovatorDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { patents, loading } = usePatents({ userId: user?.id, autoLoad: true });
  const [conversationCount, setConversationCount] = useState(0);
  const [analytics, setAnalytics] = useState<{ totalPatents: number; totalViews: number; totalInterest: number; averageViewsPerPatent: number } | null>(null);
  const [proposalSummary, setProposalSummary] = useState({ pending: 0, active: 0, completed: 0, cancelled: 0 });
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "Innovator") {
      navigate(getDashboardPathForRole(user.role));
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    const loadExtras = async () => {
      if (!user) return;
      try {
        setLoadingExtras(true);
        const [conversations, patentAnalytics, investments] = await Promise.all([
          chatService.getConversations(),
          patentService.getMyAnalytics(),
          investmentService.getInvestments(),
        ]);

        const incoming = investments.filter((investment: Investment) => investment.innovator?._id === user.id);
        setConversationCount(conversations.length);
        setAnalytics(patentAnalytics.summary);
        setProposalSummary({
          pending: incoming.filter((item) => item.status === "pending").length,
          active: incoming.filter((item) => item.status === "active").length,
          completed: incoming.filter((item) => item.status === "completed").length,
          cancelled: incoming.filter((item) => item.status === "cancelled").length,
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load dashboard data");
      } finally {
        setLoadingExtras(false);
      }
    };

    void loadExtras();
  }, [user?.id]);

  const totalViews = useMemo(() => patents.reduce((sum, patent) => sum + (patent.views || 0), 0), [patents]);
  const totalInterested = useMemo(() => patents.reduce((sum, patent) => sum + (patent.interested || 0), 0), [patents]);

  const stats = [
    { label: "My patents", value: patents.length.toString(), icon: FileText },
    { label: "Pending proposals", value: proposalSummary.pending.toString(), icon: TrendingUp },
    { label: "Portfolio views", value: totalViews.toLocaleString(), icon: Eye },
    { label: "Conversations", value: conversationCount.toString(), icon: MessageSquare },
  ];

  if (authLoading || !user || user.role !== "Innovator") {
    return authLoading ? <LoadingSpinner /> : null;
  }

  if (loading || loadingExtras) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">Innovator Dashboard</h1>
              <p className="text-sm text-gray-600 md:text-base">
                Welcome back, {user.name || "Innovator"}. Manage your portfolio, review incoming proposals, and keep conversations moving.
              </p>
            </div>
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link to="/upload-patent">
                <Plus className="mr-2 h-4 w-4" />
                Submit New Patent
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <Icon className="h-7 w-7 text-blue-600" />
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="mb-1 text-2xl font-bold md:text-3xl">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-6 lg:col-span-2">
            <Tabs defaultValue="patents">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="patents">My patents</TabsTrigger>
                <TabsTrigger value="pipeline">Deal pipeline</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="patents" className="space-y-4">
                {patents.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-semibold">No patents yet</h3>
                      <p className="mb-4 text-sm text-gray-600">Start by submitting your first patent to the platform.</p>
                      <Button asChild>
                        <Link to="/upload-patent">
                          <Plus className="mr-2 h-4 w-4" />
                          Submit your first patent
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  patents.map((patent) => (
                    <Card key={patent._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="h-36 w-full flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 sm:w-36">
                            {patent.image ? (
                              <img src={patent.image} alt={patent.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Search className="h-10 w-10 text-white/60" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge>{patent.category}</Badge>
                              <Badge variant="outline">{patent.status}</Badge>
                              <Badge className={moderationBadge[patent.moderationStatus || "approved"] || "bg-gray-100 text-gray-700 border-gray-200"}>
                                {(patent.moderationStatus || "approved").replace("_", " ")}
                              </Badge>
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">{patent.title}</h3>
                            <p className="mb-3 line-clamp-2 text-sm text-gray-600">{patent.description}</p>
                            <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center"><Eye className="mr-1 h-4 w-4" />{patent.views || 0}</span>
                              <span className="flex items-center"><Heart className="mr-1 h-4 w-4" />{patent.interested || 0}</span>
                              <span>{patent.patentNumber}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" asChild>
                                <Link to={`/patent/${patent._id}`}>View patent</Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link to="/my-patents">Manage portfolio</Link>
                              </Button>
                            </div>
                            {patent.adminNotes ? (
                              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">Admin note: {patent.adminNotes}</p>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="pipeline">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal pipeline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border bg-amber-50 p-4">
                        <p className="text-sm text-gray-600">Pending proposals</p>
                        <p className="mt-2 text-3xl font-bold text-amber-700">{proposalSummary.pending}</p>
                      </div>
                      <div className="rounded-xl border bg-blue-50 p-4">
                        <p className="text-sm text-gray-600">Active deals</p>
                        <p className="mt-2 text-3xl font-bold text-blue-700">{proposalSummary.active}</p>
                      </div>
                      <div className="rounded-xl border bg-emerald-50 p-4">
                        <p className="text-sm text-gray-600">Completed deals</p>
                        <p className="mt-2 text-3xl font-bold text-emerald-700">{proposalSummary.completed}</p>
                      </div>
                      <div className="rounded-xl border bg-gray-50 p-4">
                        <p className="text-sm text-gray-600">Closed or declined</p>
                        <p className="mt-2 text-3xl font-bold text-gray-800">{proposalSummary.cancelled}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button asChild>
                        <Link to="/investments?status=pending">Review pending proposals</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/investments?status=active">Open active deal workspace</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">Messaging activity</h3>
                    <p className="mb-4 text-sm text-gray-600">
                      You currently have {conversationCount} active conversation{conversationCount === 1 ? "" : "s"}.
                    </p>
                    <Button asChild>
                      <Link to="/messages">Open Messages</Link>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link to="/upload-patent">Submit a patent</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/my-patents">Manage my patents</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/investments?status=pending">Review proposals</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/analytics">View analytics</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between"><span>Patents submitted</span><span className="font-semibold text-gray-900">{analytics?.totalPatents || patents.length}</span></div>
                <div className="flex items-center justify-between"><span>Portfolio views</span><span className="font-semibold text-gray-900">{analytics?.totalViews || totalViews}</span></div>
                <div className="flex items-center justify-between"><span>Interest received</span><span className="font-semibold text-gray-900">{analytics?.totalInterest || totalInterested}</span></div>
                <div className="flex items-center justify-between"><span>Average views per patent</span><span className="font-semibold text-gray-900">{analytics?.averageViewsPerPatent || 0}</span></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
