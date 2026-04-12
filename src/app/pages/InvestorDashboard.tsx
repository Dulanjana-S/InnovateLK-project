import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight, DollarSign, Heart, MessageSquare, Search, TrendingUp, Bell } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../contexts/AuthContext";
import { usePatents } from "../hooks/usePatents";
import { chatService, investmentService, notificationService, type Investment } from "../services";
import { getDashboardPathForRole } from "../utils/roleRouting";

const statusBadge: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  active: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export function InvestorDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { patents, loading } = usePatents({ autoLoad: true });
  const [conversationCount, setConversationCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loadingExtras, setLoadingExtras] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "Investor") {
      navigate(getDashboardPathForRole(user.role));
    }
  }, [authLoading, navigate, user]);

  useEffect(() => {
    const loadExtras = async () => {
      if (!user) return;
      try {
        setLoadingExtras(true);
        const [conversations, unreadCount, allInvestments] = await Promise.all([
          chatService.getConversations(),
          notificationService.getUnreadCount(),
          investmentService.getInvestments(),
        ]);
        setConversationCount(conversations.length);
        setUnreadNotifications(unreadCount);
        setInvestments(allInvestments.filter((item) => item.investor?._id === user.id));
      } catch (error: any) {
        toast.error(error.message || "Failed to load dashboard data");
      } finally {
        setLoadingExtras(false);
      }
    };

    void loadExtras();
  }, [user?.id]);

  const recommendedPatents = useMemo(
    () => [...patents].sort((a, b) => (b.interested + b.views) - (a.interested + a.views)).slice(0, 5),
    [patents],
  );

  const investmentSummary = useMemo(() => {
    const pending = investments.filter((item) => item.status === "pending");
    const active = investments.filter((item) => item.status === "active");
    const completed = investments.filter((item) => item.status === "completed");
    const proposedCapital = investments.reduce((sum, item) => sum + (item.amount || 0), 0);
    const activeCapital = active.reduce((sum, item) => sum + (item.amount || 0), 0);

    return {
      pendingCount: pending.length,
      activeCount: active.length,
      completedCount: completed.length,
      proposedCapital,
      activeCapital,
    };
  }, [investments]);

  const stats = [
    { label: "Open opportunities", value: recommendedPatents.length.toString(), icon: Search },
    { label: "Pending proposals", value: investmentSummary.pendingCount.toString(), icon: Heart },
    { label: "Active deals", value: investmentSummary.activeCount.toString(), icon: TrendingUp },
    { label: "Capital proposed", value: `$${investmentSummary.proposedCapital.toLocaleString()}`, icon: DollarSign },
  ];

  if (authLoading || !user || user.role !== "Investor") {
    return authLoading ? <LoadingSpinner /> : null;
  }

  if (loading || loadingExtras) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="mb-2 text-2xl font-bold md:text-3xl">Investor Dashboard</h1>
              <p className="text-sm text-green-100 md:text-base">
                Welcome back, {user.name || "Investor"}. Review strong opportunities, submit proposals, and track deal progress.
              </p>
            </motion.div>
            <Button size="lg" className="w-full bg-white text-green-700 hover:bg-green-50 sm:w-auto" asChild>
              <Link to="/browse">
                <Search className="mr-2 h-4 w-4" />
                Discover Patents
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
                      <Icon className="h-7 w-7 text-green-600" />
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
            <Tabs defaultValue="recommended">
              <TabsList className="grid h-auto w-full grid-cols-3">
                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                <TabsTrigger value="investments">My proposals</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="recommended" className="space-y-4">
                {recommendedPatents.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-600">No patents are available right now.</CardContent>
                  </Card>
                ) : (
                  recommendedPatents.map((patent) => (
                    <Card key={patent._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                          <div className="h-32 w-full flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 sm:w-40">
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
                              <Badge variant="outline">{patent.investmentStage}</Badge>
                            </div>
                            <h3 className="mb-1 text-lg font-semibold text-gray-900">{patent.title}</h3>
                            <p className="mb-3 line-clamp-2 text-sm text-gray-600">{patent.description}</p>
                            <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                              <span>{patent.views || 0} views</span>
                              <span>{patent.interested || 0} interested</span>
                              <span>{patent.fundingRequired}</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" asChild>
                                <Link to={`/patent/${patent._id}`}>View patent</Link>
                              </Button>
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/investments?patentId=${patent._id}`}>Start proposal</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="investments" className="space-y-4">
                {investments.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-600">
                      No proposals yet. Open a patent and submit your first investment proposal.
                    </CardContent>
                  </Card>
                ) : (
                  investments.map((investment) => (
                    <Card key={investment._id}>
                      <CardContent className="pt-6">
                        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{investment.patent?.title}</h3>
                            <p className="text-sm text-gray-600">Innovator: {investment.innovator?.name}</p>
                          </div>
                          <Badge className={statusBadge[investment.status] || "bg-gray-100 text-gray-700 border-gray-200"}>
                            {investment.status}
                          </Badge>
                        </div>
                        <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Amount: ${investment.amount?.toLocaleString()}</span>
                          <span>Equity: {investment.equity}%</span>
                          <span>Milestone: {investment.nextMilestone || "Not set"}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/patent/${investment.patent?._id}`}>View patent</Link>
                          </Button>
                          <Button size="sm" asChild>
                            <Link to={`/investments?status=${investment.status}`}>Open deal workspace</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="messages">
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">Conversations in progress</h3>
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
                  <Link to="/browse">Browse patents</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/investments?status=pending">Review pending proposals</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/investments?status=active">Manage active deals</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link to="/messages">Open messages</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activity snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Bell className="h-4 w-4" />Unread notifications</span>
                  <span className="font-semibold text-gray-900">{unreadNotifications}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending proposals</span>
                  <span className="font-semibold text-gray-900">{investmentSummary.pendingCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active deals</span>
                  <span className="font-semibold text-gray-900">{investmentSummary.activeCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed deals</span>
                  <span className="font-semibold text-gray-900">{investmentSummary.completedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Capital in active deals</span>
                  <span className="font-semibold text-gray-900">${investmentSummary.activeCapital.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
